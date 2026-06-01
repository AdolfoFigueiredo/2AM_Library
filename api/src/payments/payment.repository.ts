import { pool } from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class PaymentRepository {
  static async createPayment(
    saleId: number,
    paymentMethodId: number,
    status: "Pending" | "Paid" | "Failed",
  ): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Payments (saleId, paymentMethodId, paymentStatus, paymentDate) 
       VALUES (?, ?, ?, ?)`,
      [saleId, paymentMethodId, status, status === "Paid" ? new Date() : null],
    );
    return result.insertId;
  }

  static async findBySaleId(saleId: number): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.id, p.saleId, pm.name AS method, p.paymentStatus, p.paymentDate 
       FROM Payments p
       LEFT JOIN PaymentMethods pm ON p.paymentMethodId = pm.id
       WHERE p.saleId = ? AND p.deletedAt IS NULL`,
      [saleId],
    );
    return rows[0] || null;
  }

  static async updateStatus(
    saleId: number,
    status: "Pending" | "Paid" | "Failed",
  ): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Payments 
       SET paymentStatus = ?, paymentDate = ?, updatedAt = NOW() 
       WHERE saleId = ?`,
      [status, status === "Paid" ? new Date() : null, saleId],
    );
    return result.affectedRows > 0;
  }
}
