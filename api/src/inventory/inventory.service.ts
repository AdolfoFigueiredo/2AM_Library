import { InventoryRepository } from "./inventory.repository.js";
import { ReplenishStockDto, LowStockReportDto } from "./inventory.dto.js";
import { BookRepository } from "../books/book.repository.js";
import { SupplierRepository } from "../suppliers/supplier.repository.js";

export class InventoryService {
  /**
   * Regra de negócio para reabastecimento de stock
   */
  static async replenishStock(dto: ReplenishStockDto): Promise<void> {
    const bookExists = await BookRepository.findById(dto.bookId);
    if (!bookExists) throw new Error("O livro especificado não existe.");

    const supplierExists = await SupplierRepository.findById(dto.supplierId);
    if (!supplierExists)
      throw new Error("O fornecedor especificado não existe.");

    // Executa a operação atómica de entrada e atualização
    await InventoryRepository.replenishStock(dto);
  }

  /**
   * Recupera a lista de livros com stock crítico para o painel de compras do ERP
   */
  static async getLowStockAlerts(): Promise<LowStockReportDto[]> {
    const CRITICAL_THRESHOLD = 5;
    return await InventoryRepository.getLowStockReport(CRITICAL_THRESHOLD);
  }
}
