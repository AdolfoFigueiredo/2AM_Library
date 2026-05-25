import { pool } from "../config/db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { generateDynamicUpdate } from "../utils/dynamicUpdate.js";
import { CreateBookDto, UpdateBookDto, BookFiltersDto } from "./book.dto.js";

export class BookRepository {
  private static dynamicUpdate = generateDynamicUpdate;

  static async getById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM v_BookDetails WHERE id = ? AND deletedAt IS NULL`,
      [id],
    );
    return rows[0] || null;
  }

  static async getAll(limit: number = 50) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM v_BookDetails WHERE deletedAt IS NULL LIMIT ?`,
      [limit],
    );
    return rows;
  }

  static async create(dto: CreateBookDto) {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Books (name, releaseDate, publisherId, description, coverImageUrl, edition, authorId, isbn, currentPrice)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.name,
        dto.releaseDate || null,
        dto.publisherId || null,
        dto.description || null,
        dto.coverImageUrl || null,
        dto.edition || null,
        dto.authorId || null,
        dto.isbn || null,
        dto.currentPrice,
      ],
    );

    await pool.execute(
      `INSERT INTO Inventory (bookId, quantity) VALUES (?, 0)`,
      [result.insertId],
    );
    return result.insertId;
  }

  static async update(id: number, dto: UpdateBookDto) {
    const { query, values } = this.dynamicUpdate("Books", dto, "id", id);
    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  static async softDelete(id: number) {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Books 
       SET deletedAt = ? 
       WHERE id = ? AND deletedAt IS NULL`,
      [new Date(), id],
    );
    return result.affectedRows > 0;
  }

  static async getByIsbn(isbn: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM v_BookDetails WHERE isbn = ? AND deletedAt IS NULL`,
      [isbn],
    );
    return rows[0] || null;
  }

  static async findByFilters(filters: BookFiltersDto) {
    const values: any[] = [];

    let query = `SELECT * FROM v_BookDetails WHERE deletedAt IS NULL`;

    if (filters.name) {
      query += ` AND title LIKE ?`;
      values.push(`%${filters.name}%`);
    }

    if (filters.isbn) {
      query += ` AND isbn = ?`;
      values.push(filters.isbn);
    }

    if (filters.authorId) {
      query += ` AND authorId = ?`;
      values.push(filters.authorId);
    }

    if (filters.publisherId) {
      query += ` AND publisherId = ?`;
      values.push(filters.publisherId);
    }

    if (filters.categoryId) {
      query += ` AND id IN (SELECT bookId FROM BookCategories WHERE categoryId = ?)`;
      values.push(filters.categoryId);
    }

    query += ` ORDER BY title ASC`;

    if (filters.limit) {
      query += ` LIMIT ?`;
      values.push(filters.limit);
    } else {
      query += ` LIMIT 50`;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, values);
    return rows;
  }
}
