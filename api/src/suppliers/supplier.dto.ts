import { z } from "zod";

export const SupplierSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3, "Nome do fornecedor deve ter pelo menos 3 letras"),
  taxId: z.string().min(11, "BI/NIF deve ter 11 caracteres"),
});

export const SupplierPhoneSchema = z.object({
  id: z.number().int().positive(),
  phone: z.number().positive().int(),
  userId: z.number().int().positive(),
});

export const CreateSupplierSchema = SupplierSchema.omit({ id: true });
export const UpdateSupplierSchema = CreateSupplierSchema.partial();
export const CreateSupplierPhoneSchema = SupplierPhoneSchema.omit({ id: true });
export const UpdateSupplierPhoneSchema = SupplierPhoneSchema.partial();

export type SupplierDto = z.infer<typeof SupplierSchema>;
export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>;
export type CreateSupplierPhoneDto = z.infer<typeof CreateSupplierPhoneSchema>;
export type UpdateSupplierPhoneDto = z.infer<typeof UpdateSupplierPhoneSchema>;
