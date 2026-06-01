import { z } from "zod";

export const BookSchema = z.object({
  id: z.number().positive().int(),
  name: z.string().min(1, "O nome do livro é obrigatório"),
  releaseDate: z.coerce.date().optional().nullable(),
  publisherId: z.number().positive().int().optional().nullable(),
  description: z.string().optional().nullable(),
  coverImageUrl: z.string().url("URL da capa inválida").optional().nullable(),
  edition: z.string().optional().nullable(),
  authorId: z.number().positive().int().optional().nullable(),
  isbn: z.string().min(10, "ISBN inválido").optional().nullable(),
  currentPrice: z.number().positive("O preço deve ser maior que zero"),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// 2. Schema de Criação e Atualização
export const CreateBookSchema = BookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export const UpdateBookSchema = CreateBookSchema.partial();

export const BookFiltersSchema = z.object({
  name: z.string().optional(),
  isbn: z.string().optional(),
  edition: z.string().optional(),
  authorId: z.coerce.number().positive().int().optional(),
  publisherId: z.coerce.number().positive().int().optional(),
  categoryId: z.coerce.number().positive().int().optional(),

  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().default("id"),
  order: z.enum(["ASC", "DESC", "asc", "desc"]).default("ASC"),
});

export type BookDto = z.infer<typeof BookSchema>;
export type CreateBookDto = z.infer<typeof CreateBookSchema>;
export type UpdateBookDto = z.infer<typeof UpdateBookSchema>;
export type BookFiltersDto = z.infer<typeof BookFiltersSchema>;
