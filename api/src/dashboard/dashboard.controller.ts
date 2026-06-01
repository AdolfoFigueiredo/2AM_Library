import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class DashboardController {
  /**
   * Retorna as métricas consolidadas para os blocos/cards informativos do ERP
   */
  static async getOverview(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const metrics = await DashboardService.getOverviewMetrics();
      ApiResponse.success(res, metrics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna a listagem analítica do resumo de faturamento para relatórios e tabelas do ERP
   */
  static async getSalesReport(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const report = await DashboardService.getSalesReport();
      ApiResponse.success(res, report);
    } catch (error) {
      next(error);
    }
  }
}
