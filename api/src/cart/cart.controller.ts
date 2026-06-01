import { Request, Response, NextFunction } from "express";
import { CartService } from "./cart.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class CartController {
  /**
   * POST /api/cart/items
   * Adiciona ou incrementa um livro no carrinho do utilizador logad
   */

  static async addItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Para testes rápidos, podes simular passando no body ou de forma estática
      const userId = req.body.userId || 1;
      await CartService.addItem(userId, req.body);
      ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cart
   * Retorna o carrinho completo do utilizador com o subtotal e preço total calculado
   */

  static async getCart(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.body.userId || 1; // Ajustar para req.user.id após JWT
      const cart = await CartService.getCart(userId);
      ApiResponse.success(res, cart);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cart/items/:id
   * Remove um item específico do carrinho usando o ID da tabela CartItems
   */

  static async removeItem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { cartItemId } = req.params;
      await CartService.removeItem(Number(cartItemId));
      ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  }
}
