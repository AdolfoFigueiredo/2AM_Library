import { z } from "zod";

// Valida a entrada de itens no carrinho
export const AddToCartSchema = z.object({
  bookId: z
    .number({ required_error: "O ID do livro é obrigatório." })
    .int()
    .positive(),
  quantity: z
    .number({ required_error: "A quantidade é obrigatória." })
    .int()
    .positive("A quantidade deve ser pelo menos 1."),
});

export type AddToCartDto = z.infer<typeof AddToCartSchema>;

// Interface para estruturar o retorno completo do carrinho no E-commerce
export interface CartItemDetailsDto {
  cartItemId: number;
  bookId: number;
  bookName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartResponseDto {
  cartId: number;
  userId: number;
  items: CartItemDetailsDto[];
  totalCartPrice: number;
}
