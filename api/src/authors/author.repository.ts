import { pool } from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class AuthorRepository {
  static async create(name: string): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO Authors (name) VALUES (?)",
      [name],
    );
    return result.insertId;
  }

  static async findAll(): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name, createdAt FROM Authors WHERE deletedAt IS NULL ORDER BY name ASC",
    );
    return rows;
  }

  static async findById(id: number): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name, createdAt FROM Authors WHERE id = ? AND deletedAt IS NULL",
      [id],
    );
    return rows[0] || null;
  }

  static async update(id: number, name: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE Authors SET name = ?, updatedAt = NOW() WHERE id = ? AND deletedAt IS NULL",
      [name, id],
    );
    return result.affectedRows > 0;
  }

  static async softDelete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE Authors SET deletedAt = NOW() WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}
