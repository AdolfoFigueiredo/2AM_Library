import { CartRepository } from "./cart.repository.js";
import { AddToCartDto, CartResponseDto } from "./cart.dto.js";

export class CartService {
  /**
   * Adiciona um livro ao carrinho do utilizador
   */

  static async addItem(userId: number, dto: AddToCartDto): Promise<void> {
    const cartId = await CartRepository.getOrCreateCart(userId);
    await CartRepository.addItemToCart(cartId, dto);
  }

  /**
   * Obtém o carrinho completo do utilizador com o total calculado
   */

  static async getCart(userId: number): Promise<CartResponseDto> {
    const cartId = await CartRepository.getOrCreateCart(userId);
    const items = await CartRepository.getCartDetails(cartId);

    const totalCartPrice = items.reduce(
      (acc, item) => acc + Number(item.subtotal),
      0,
    );

    return {
      cartId,
      userId,
      items,
      totalCartPrice,
    };
  }

  /**
   * Remove um item do carrinho pelo ID do CartItem
   */
  static async removeItem(cartItemId: number): Promise<void> {
    const deleted = await CartRepository.removeItem(cartItemId);
    if (!deleted) {
      throw new Error("Item do carrinho não encontrado ou já removido.");
    }
  }
}
