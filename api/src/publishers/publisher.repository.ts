import { pool } from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class PublisherRepository {
  static async create(name: string): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO Publishers (name) VALUES (?)",
      [name],
    );
    return result.insertId;
  }

  static async findAll(): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name, createdAt FROM Publishers WHERE deletedAt IS NULL ORDER BY name ASC",
    );
    return rows;
  }

  static async findById(id: number): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name, createdAt FROM Publishers WHERE id = ? AND deletedAt IS NULL",
      [id],
    );
    return rows[0] || null;
  }

  static async update(id: number, name: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE Publishers SET name = ?, updatedAt = NOW() WHERE id = ? AND deletedAt IS NULL",
      [name, id],
    );
    return result.affectedRows > 0;
  }

  static async softDelete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE Publishers SET deletedAt = NOW() WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}
