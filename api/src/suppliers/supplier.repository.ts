import { pool } from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { CreateSupplierDto, UpdateSupplierDto } from "./supplier.dto.js";
import { generateDynamicUpdate } from "../utils/dynamicUpdate.js";

export class SupplierRepository {
  private static baseQuery = `
        SELECT s.id, name, taxId, 
        sp.phone as phoneNumber, 
        spp.purchaseDate, spp.totalCost  
        FROM Suppliers s 
        LEFT JOIN SupplierPhones sp ON sp.supplierId = s.id 
        LEFT JOIN SupplierPurchases spp ON spp.supplierId = s.id 
    `;

  static async findAll(limit: number = 50) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      ` ${this.baseQuery} LIMIT ?`,
      [limit],
    );
    return rows;
  }

  static async findById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${this.baseQuery} WHERE s.id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  static async findUnique(name: string, taxId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${this.baseQuery} WHERE s.name = ? OR s.taxId = ?`,
      [name, taxId],
    );
    return rows[0] || null;
  }

  static async findByTaxId(taxId: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `${this.baseQuery} WHERE s.taxId = ?`,
      [taxId],
    );
    return rows[0] || null;
  }

  static async create(dto: CreateSupplierDto) {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Suppliers (name, taxId) VALUES(?, ?)`,
      [dto.name, dto.taxId],
    );
    return result.insertId;
  }

  static async update(id: number, dto: UpdateSupplierDto) {
    const { query, values } = generateDynamicUpdate("Suppliers", dto, "id", id);
    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  static async softDelete(id: number) {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Suppliers
      SET deletedAt = NOW()
      WHERE id = ?`,
      [id],
    );
  }

  static async addPhone(supplierId: number, phone: string): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO SupplierPhones (supplierId, phone) VALUES (?, ?)",
      [supplierId, phone],
    );
    return result.insertId;
  }

  static async findPhonesBySupplierId(supplierId: number): Promise<string[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT phone FROM SupplierPhones WHERE supplierId = ? AND deletedAt IS NULL",
      [supplierId],
    );
    return rows.map((row) => row.phone);
  }
}
