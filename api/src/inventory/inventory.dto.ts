import { z } from "zod";

// Schema para entrada de novas unidades de um livro (Reabastecimento)
export const ReplenishStockSchema = z.object({
  bookId: z.number({ error: "O ID do livro é obrigatório." }).int().positive(),
  supplierId: z
    .number({ error: "O ID do fornecedor é obrigatório." })
    .int()
    .positive(),
  quantity: z
    .number({ error: "A quantidade é obrigatória." })
    .int()
    .positive("A quantidade deve ser maior que zero."),
  purchasePrice: z
    .number({ error: "O preço de compra é obrigatório." })
    .positive("O preço de custo deve ser maior que zero."),
});

export type ReplenishStockDto = z.infer<typeof ReplenishStockSchema>;

export interface LowStockReportDto {
  bookId: number;
  title: string;
  currentStock: number;
  supplierName: string | null;
}
