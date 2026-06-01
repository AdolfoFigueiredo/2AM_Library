import { z } from "zod";

// Schema base que mapeia os campos exatamente como estão na tabela do banco
export const CategorySchema = z.object({
  id: z.number().positive().int(),
  name: z
    .string()
    .min(2, "O nome da categoria deve ter pelo menos 2 caracteres"),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para criação de novas categorias (omitimos campos gerados pelo banco)
export const CreateCategorySchema = CategorySchema.pick({
  name: true,
});

// Schema para atualização de categorias (campos parciais baseados no de criação)
export const UpdateCategorySchema = CreateCategorySchema.partial();

// Definição dos tipos TypeScript inferidos através dos Schemas do Zod
export type CategoryDto = z.infer<typeof CategorySchema>;
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
