import { pool } from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { AddToCartDto } from "./cart.dto.js";

export class CartRepository {
  /**
   * Obtém o ID do carrinho ativo do utilizador. Se não existir, cria um.
   */
  static async getOrCreateCart(userId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM Cart WHERE userId = ? AND deletedAt IS NULL LIMIT 1",
      [userId],
    );

    if (rows.length > 0) {
      return rows[0].id;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO Cart (userId, createdAt, updatedAt) VALUES (?, NOW(), NOW())",
      [userId],
    );

    return result.insertId;
  }

  /**
   * Insere um item no carrinho. Se o livro já existir lá, incrementa a quantidade automaticamente.
   */
  static async addItemToCart(cartId: number, dto: AddToCartDto): Promise<void> {
    await pool.execute(
      `INSERT INTO CartItems (cartId, bookId, quantity, createdAt, updatedAt)
       VALUES (?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE 
          quantity = quantity + VALUES(quantity),
          updatedAt = NOW()`,
      [cartId, dto.bookId, dto.quantity],
    );
  }

  /**
   * Lista os detalhes do carrinho calculando os subtotais com base no preço atual do livro
   */
  static async getCartDetails(cartId: number): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        ci.id AS cartItemId,
        ci.bookId,
        b.name AS bookName,
        b.coverImageUrl,
        b.currentPrice AS unitPrice,
        ci.quantity,
        (ci.quantity * b.currentPrice) AS subtotal
       FROM CartItems ci
       INNER JOIN Books b ON ci.bookId = b.id
       WHERE ci.cartId = ? AND ci.deletedAt IS NULL`,
      [cartId],
    );
    return rows;
  }

  /**
   * Remove fisicamente um item do carrinho
   */
  static async removeItem(cartItemId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM CartItems WHERE id = ?",
      [cartItemId],
    );
    return result.affectedRows > 0;
  }
}
