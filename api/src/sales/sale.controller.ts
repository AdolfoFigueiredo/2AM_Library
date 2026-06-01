import { Request, Response } from "express";
import { SaleService } from "./sale.service.js";
import { ProcessSaleSchema, SaleFiltersSchema } from "./sale.dto.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class SaleController {
  static async checkout(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = ProcessSaleSchema.parse(req.body);
      await SaleService.createFromCart(validatedData);

      ApiResponse.success(
        res,
        { message: "Venda processada e estoque atualizado com sucesso!" },
        201,
      );
    } catch (error: any) {
      if (error.issues) {
        ApiResponse.error(
          res,
          "Dados de checkout inválidos.",
          400,
          error.format(),
        );
        return;
      }
      ApiResponse.error(res, error.message, 400);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, "ID de venda inválido.", 400);
        return;
      }
      const sale = await SaleService.getById(id);
      ApiResponse.success(res, sale);
    } catch (error: any) {
      ApiResponse.error(res, error.message, 404);
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const validatedFilters = SaleFiltersSchema.parse(req.query);
      const sales = await SaleService.getAll(validatedFilters);

      ApiResponse.success(res, sales);
    } catch (error: any) {
      ApiResponse.error(res, error.message, 500);
    }
  }

  static async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (
        isNaN(id) ||
        !["Pending", "Completed", "Cancelled"].includes(status)
      ) {
        ApiResponse.error(
          res,
          "Parâmetros de alteração de status inválidos.",
          400,
        );
        return;
      }

      await SaleService.updateStatus(id, status);
      ApiResponse.success(res, {
        message: `Status da venda alterado para '${status}' com sucesso.`,
      });
    } catch (error: any) {
      ApiResponse.error(res, error.message, 400);
    }
  }
}
