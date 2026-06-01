import { pool } from "../config/db.js";
import { RowDataPacket } from "mysql2";
import { ReplenishStockDto, LowStockReportDto } from "./inventory.dto.js";

export class InventoryRepository {
  /**
   * Executa o reabastecimento chamando de forma direta e segura
   * a Stored Procedure sp_ReplenishInventory do MariaDB.
   */
  static async replenishStock(dto: ReplenishStockDto): Promise<void> {
    // 💡 Chamada limpa e atómica. O banco resolve toda a transação internamente!
    await pool.query("CALL sp_ReplenishInventory(?, ?, ?, ?)", [
      dto.supplierId,
      dto.bookId,
      dto.quantity,
      dto.purchasePrice, // Certifica-te que o DTO mapeia para o preço de custo correto
    ]);
  }

  /**
   * Encontra livros com stock crítico ou nulo utilizando a view v_InventoryStatus
   */
  static async getLowStockReport(
    threshold: number = 5,
  ): Promise<LowStockReportDto[]> {
    // 💡 Otimizado para consumir a View estável do banco, eliminando múltiplos JOINs manuais
    const query = `
      SELECT 
        bookId,
        bookName AS title,
        currentStock,
        publisherName AS supplierName
      FROM v_InventoryStatus
      WHERE currentStock <= ? OR stockStatus = 'Out of Stock'
      ORDER BY currentStock ASC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [threshold]);
    return rows as LowStockReportDto[];
  }
}
