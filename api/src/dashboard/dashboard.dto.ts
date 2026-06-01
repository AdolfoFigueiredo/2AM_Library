import { z } from "zod";

export const SalesSummarySchema = z.object({
  saleId: z.number().positive().int(),
  customerName: z.string(),
  totalAmount: z.number(),
  orderStatus: z.enum(["Pending", "Completed", "Cancelled"]),
  paymentMethod: z.string().nullable(),
  paymentStatus: z.enum(["Pending", "Paid", "Failed"]).nullable(),
  saleDate: z.date(),
});

// Schema para os livros mais vendidos (v_TopSellingBooks)
export const TopSellingBookSchema = z.object({
  name: z.string(),
  totalUnitsSold: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
});

// Schema consolidado para as métricas gerais do ERP (Cards do Dashboard)
export const DashboardMetricsSchema = z.object({
  totalRevenue: z.number(),
  totalSalesCount: z.number().int(),
  pendingOrdersCount: z.number().int(),
  topBooks: z.array(TopSellingBookSchema),
});

// Tipos inferred para o TypeScript
export type SalesSummaryDto = z.infer<typeof SalesSummarySchema>;
export type TopSellingBookDto = z.infer<typeof TopSellingBookSchema>;
export type DashboardMetricsDto = z.infer<typeof DashboardMetricsSchema>;
