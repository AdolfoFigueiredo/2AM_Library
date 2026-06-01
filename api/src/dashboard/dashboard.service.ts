// src/dashboard/dashboard.service.ts
import { DashboardRepository } from "./dashboard.repository.js";
import {
  DashboardMetricsDto,
  SalesSummaryDto,
  DashboardMetricsSchema,
  SalesSummarySchema,
} from "./dashboard.dto.js";

export class DashboardService {
  /**
   * Consolida e valida as métricas para o painel de entrada do ERP
   */
  static async getOverviewMetrics(): Promise<DashboardMetricsDto> {
    const counters = await DashboardRepository.getCounters();
    const topBooks = await DashboardRepository.getTopSellingBooks();

    const rawData = {
      totalRevenue: counters.totalRevenue,
      totalSalesCount: counters.totalSalesCount,
      pendingOrdersCount: counters.pendingOrdersCount,
      topBooks: topBooks,
    };

    // Validação em tempo de execução garantindo o contrato do DTO
    return DashboardMetricsSchema.parse(rawData);
  }

  /**
   * Retorna e valida o histórico analítico de faturamento
   */
  static async getSalesReport(): Promise<SalesSummaryDto[]> {
    const salesSummary = await DashboardRepository.getSalesSummary();

    // Valida cada item do array contra o esquema definido
    return salesSummary.map((sale) => SalesSummarySchema.parse(sale));
  }
}
