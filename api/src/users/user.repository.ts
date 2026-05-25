import { pool } from "../config/db.js";
import { UserDto, SafeUserDto, UpdateUserDto } from "./user.dto";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { generateDynamicUpdate } from "../utils/dynamicUpdate.js";

export class UserRepository {
  constructor() {}

  private static dynamicUpdate = generateDynamicUpdate;

  private static baseQuery = `
    SELECT  u.firstName, u.lastName, u.email, u.taxId,
      u.municipality, u.neighborhood, u.gender, u.birthDate,
      u.role, u.createdAt, u.updatedAt,
      up.id phoneId, up.phone phone
    FROM Users u
    LEFT JOIN UserPhones up ON up.userId = u.id
  `;

  static async getById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${this.baseQuery} WHERE u.id = ? AND u.deletedAt IS NULL `,
      [id],
    );
    return rows[0] as SafeUserDto;
  }

  static async getByEmail(email: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      ` ${this.baseQuery} WHERE u.email = ? AND u.deletedAt IS NULL`,
      [email],
    );
    return rows[0] as SafeUserDto;
  }

  static async getAll(Limit: number = 50) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${this.baseQuery} WHERE u.deletedAt IS NULL LIMIT ?`,
      [Limit],
    );
    return rows as SafeUserDto[];
  }

  static async getDesativatedById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      ` ${this.baseQuery} WHERE u.id = ?`,
      [id],
    );
    return rows[0] as SafeUserDto;
  }

  static async create(dto: UserDto) {
    const [result] = await pool.execute<ResultSetHeader>(
      ` INSERT INTO Users ( firstName, lastName, 
          email, passwordHash, taxId, municipality, neighborhood, gender, birthDate, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.passwordHash,
        dto.taxId,
        dto.municipality ?? null,
        dto.neighborhood ?? null,
        dto.gender,
        dto.birthDate,
        dto.role ?? "customer",
      ],
    );
    return result.insertId;
  }

  static async update(id: number, dto: UpdateUserDto) {
    const { query, values } = this.dynamicUpdate("Users", dto, "id", id);
    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  static async softDelete(id: number) {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Users 
       SET deletedAt = ? 
       WHERE id = ? `,
      [new Date(), id],
    );
    return result.affectedRows > 0;
  }
}
