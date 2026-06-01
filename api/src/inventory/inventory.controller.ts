import { Request, Response, NextFunction } from "express";
import { InventoryService } from "./inventory.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class InventoryController {
  /**
   * Endpoint para o gestor dar entrada de stock de um livro via ERP
   */
  static async replenish(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await InventoryService.replenishStock(req.body);
      ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint que lista os livros com stock crítico para o painel de alertas do ERP
   */
  static async getLowStockAlerts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const alerts = await InventoryService.getLowStockAlerts();
      ApiResponse.success(res, alerts);
    } catch (error) {
      next(error);
    }
  }
}
