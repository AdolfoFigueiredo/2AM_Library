import { pool } from "../config/db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ProcessSaleDto, SaleFiltersDto } from "./sale.dto.js";

export class SaleRepository {
  static async processSale(dto: ProcessSaleDto): Promise<boolean> {
    await pool.query("CALL sp_ProcessSale(?, ?)", [dto.userId, dto.saleType]);
    return true;
  }

  static async getById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM v_SalesSummary WHERE saleId = ?",
      [id],
    );
    return rows[0] || null;
  }

  // Lista vendas através da View aplicando filtros dinâmicos opcionais
  static async getAll(filters: SaleFiltersDto) {
    const values: any[] = [];
    let query = "SELECT * FROM v_SalesSummary WHERE 1=1";

    if (filters.status) {
      query += " AND orderStatus = ?";
      values.push(filters.status);
    }

    if (filters.saleType) {
      query += " AND saleId IN (SELECT id FROM Sales WHERE saleType = ?)";
      values.push(filters.saleType);
    }

    query += " ORDER BY saleDate DESC";

    if (filters.limit) {
      query += " LIMIT ?";
      values.push(filters.limit);
    } else {
      query += " LIMIT 50";
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, values);
    return rows;
  }

  // Método para atualizar o status da venda (Ex: Cancelar ou Completar)
  static async updateStatus(
    id: number,
    status: "Pending" | "Completed" | "Cancelled",
  ): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE Sales SET status = ? WHERE id = ?",
      [status, id],
    );
    return result.affectedRows > 0;
  }
}
