import { z } from "zod";

export enum SaleStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}
export enum SaleType {
  PHYSYCAL_STORE = "PhysicalStore",
  ONLINE = "Online",
}

export const SaleSchema = z.object({
  id: z.number().positive().int(),
  customerId: z.number().positive().int(),
  userId: z.number().int().positive(),
  saleDate: z.date().nullable(),
  totalAmount: z.number().positive(),
  status: z.enum(SaleStatus),
  saleType: z.enum(SaleType),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const CreateSaleSchema = SaleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const ProcessSaleSchema = z.object({
  userId: z.number().positive().int("ID do usuário/cliente inválido"),
  saleType: z.enum(SaleType, {
    error: "Tipo de venda deve ser 'PhysicalStore' ou 'Online'",
  }),
});

export const SaleFiltersSchema = z.object({
  status: z.enum(["Pending", "Completed", "Cancelled"]).optional(),
  saleType: z.enum(["PhysicalStore", "Online"]).optional(),
  limit: z.coerce.number().positive().int().optional(),
});

export type ProcessSaleDto = z.infer<typeof ProcessSaleSchema>;
export type SaleFiltersDto = z.infer<typeof SaleFiltersSchema>;

export const UpdateSaleSchema = CreateSaleSchema.partial();
export type SaleDto = z.infer<typeof SaleSchema>;
export type CreateSaleDto = z.infer<typeof CreateSaleSchema>;
export type UpdateSaleDto = z.infer<typeof UpdateSaleSchema>;
