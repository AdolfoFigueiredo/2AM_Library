import { Request, Response } from "express";
import { SupplierService } from "./supplier.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CreateSupplierDto, UpdateSupplierDto } from "./supplier.dto.js";

export class SupplierController {
  static async getAll(req: Request, res: Response) {
    try {
      const { limit } = req.params;
      const suppliers = await SupplierService.getAll(Number(limit));
      ApiResponse.success(res, suppliers, 200);
    } catch (err: any) {
      ApiResponse.error(res, err.message || "Erro de servidor");
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await SupplierService.getById(Number(id));
      if (!supplier) ApiResponse.error(res, "Fornecedor não encontrado", 404);
      ApiResponse.success(res, supplier, 200);
    } catch (err: any) {
      ApiResponse.error(res, err.message || "Erro de Servidor");
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, taxId }: CreateSupplierDto = req.body;
      const existedSupplier = await SupplierService.getByTaxId(taxId);
      if (existedSupplier) throw new Error("Bi/Nif já cadastrado");
      const supplierId = await SupplierService.create({ name, taxId });
      ApiResponse.success(res, supplierId, 201);
    } catch (err: any) {
      ApiResponse.error(res, err.message || "Erro de Servidor");
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, taxId }: UpdateSupplierDto = req.body;
      const existedSupplier = await SupplierService.getById(Number(id));
      if (!existedSupplier) throw new Error("Fornecedor não encontrado");

      const updated = await SupplierService.update(Number(id), { name, taxId });
      ApiResponse.success(res, updated);
    } catch (err: any) {
      ApiResponse.error(res, err.message || "Erro de Servidor");
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await SupplierService.delete(Number(id));
      ApiResponse.success(res, null, 204);
    } catch (err: any) {
      ApiResponse.error(res, err.message || "Erro de Servidor");
    }
  }

  static async addPhone(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { phone } = req.body;

      if (!phone) {
        res.status(400).json({
          success: false,
          message: "O campo 'phone' é obrigatório no corpo da requisição.",
        });
        return;
      }

      const data = await SupplierService.addPhone(Number(id), phone);
      ApiResponse.success(res, data, 201);
    } catch (error: any) {
      ApiResponse.error(
        res,
        error.message || "Erro ao associar telefone ao fornecedor.",
        404,
      );
    }
  }
}
