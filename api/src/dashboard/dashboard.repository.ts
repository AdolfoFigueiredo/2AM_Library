import { pool } from "../config/db.js";
import { RowDataPacket } from "mysql2";
import { SalesSummaryDto, TopSellingBookDto } from "./dashboard.dto.js";

export class DashboardRepository {
  constructor() {}

  /**
   * Retorna o resumo completo de todas as vendas registradas no sistema (View v_SalesSummary)
   */
  static async getSalesSummary(): Promise<SalesSummaryDto[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT saleId, customerName, totalAmount, orderStatus, paymentMethod, paymentStatus, saleDate 
       FROM v_SalesSummary 
       ORDER BY saleDate DESC`,
    );
    return rows as SalesSummaryDto[];
  }

  /**
   * Retorna o Top 10 de livros mais vendidos em volume e faturação (View v_TopSellingBooks)
   */
  static async getTopSellingBooks(): Promise<TopSellingBookDto[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT name, totalUnitsSold, totalRevenue FROM v_TopSellingBooks`,
    );
    return rows as TopSellingBookDto[];
  }

  /**
   * Calcula as métricas financeiras e volumétricas consolidadas para os cards principais do ERP
   */
  static async getCounters() {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN totalAmount ELSE 0 END), 0) as totalRevenue,
        COUNT(id) as totalSalesCount,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingOrdersCount
       FROM Sales`,
    );

    const counters = rows[0];
    return {
      totalRevenue: Number(counters.totalRevenue),
      totalSalesCount: Number(counters.totalSalesCount),
      pendingOrdersCount: Number(counters.pendingOrdersCount),
    };
  }
}
