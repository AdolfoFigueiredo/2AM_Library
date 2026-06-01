import { pool } from "../config/db.js";
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "./category.dto.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { generateDynamicUpdate } from "../utils/dynamicUpdate.js";

export class CategoryRepository {
  constructor() {}

  private static dynamicUpdate = generateDynamicUpdate;

  private static baseQuery = `
    SELECT id, name, createdAt, updatedAt
    FROM Categories
  `;

  static async getById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${this.baseQuery} WHERE id = ? AND deletedAt IS NULL`,
      [id],
    );
    return rows[0] as CategoryDto;
  }

  static async getByName(name: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${this.baseQuery} WHERE name = ? AND deletedAt IS NULL`,
      [name],
    );
    return rows[0] as CategoryDto;
  }

  static async getAll(limit: number = 50) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${this.baseQuery} WHERE deletedAt IS NULL LIMIT ?`,
      [limit],
    );
    return rows as CategoryDto[];
  }

  static async create(dto: CreateCategoryDto) {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Categories (name) VALUES (?)`,
      [dto.name],
    );
    return result.insertId;
  }

  static async update(id: number, dto: UpdateCategoryDto) {
    const { query, values } = this.dynamicUpdate("Categories", dto, "id", id);
    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  static async softDelete(id: number) {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Categories 
       SET deletedAt = ? 
       WHERE id = ?`,
      [new Date(), id],
    );
    return result.affectedRows > 0;
  }
}
