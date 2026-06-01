import { SaleRepository } from "./sale.repository.js";
import { pool } from "../config/db.js";
import { RowDataPacket } from "mysql2";
import { ProcessSaleDto, SaleFiltersDto } from "./sale.dto.js";

export class SaleService {
  static async createFromCart(dto: ProcessSaleDto) {
    // 1. Verificar se o cliente possui um carrinho ativo e se ele não está vazio
    const [cart] = await pool.execute<RowDataPacket[]>(
      `SELECT ci.id FROM CartItems ci 
       JOIN Cart c ON ci.cartId = c.id 
       WHERE c.userId = ? LIMIT 1`,
      [dto.userId],
    );

    if (cart.length === 0) {
      throw new Error(
        "Não é possível fechar a venda: O carrinho deste usuário está vazio.",
      );
    }

    // 2. Executa a transação via Procedure no banco de dados
    return await SaleRepository.processSale(dto);
  }

  static async getById(id: number) {
    const sale = await SaleRepository.getById(id);
    if (!sale) {
      throw new Error("Registro de venda não encontrado.");
    }
    return sale;
  }

  static async getAll(filters: SaleFiltersDto) {
    return await SaleRepository.getAll(filters);
  }

  static async updateStatus(
    id: number,
    status: "Pending" | "Completed" | "Cancelled",
  ) {
    const sale = await SaleRepository.getById(id);
    if (!sale) {
      throw new Error("Venda não encontrada para alteração de status.");
    }
    return await SaleRepository.updateStatus(id, status);
  }
}
