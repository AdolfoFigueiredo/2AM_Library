import { pool } from "../config/db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { generateDynamicUpdate } from "../utils/dynamicUpdate.js";
import {
  BaseQueryPagination,
  generateDynamicSelect,
} from "../utils/dynamicFilter.js";
import { BookFiltersDto, CreateBookDto, UpdateBookDto } from "./book.dto.js";
import { file } from "zod";

export class BookRepository {
  private static dynamicUpdate = generateDynamicUpdate;

  static async findById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM v_BookDetails WHERE bookId = ?`,
      [id],
    );
    return rows[0] || null;
  }

  static async findTopSellingsBooks() {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM v_TopSellingBooks;`,
    );
    return rows[0] || null;
  }

  static async findByIsbn(isbn: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM v_BookDetails WHERE isbn = ? AND deletedAt IS NULL`,
      [isbn],
    );
    return rows[0] || null;
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
}
