import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { CreateUserSchema, UpdateUserSchema } from "./user.dto.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class UserController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreateUserSchema.parse(req.body);
      const userId = await UserService.create(validatedData);

      ApiResponse.success(res, { id: userId }, 201);
    } catch (error: any) {
      if (error.issues) {
        ApiResponse.error(
          res,
          "Dados de validação incorretos.",
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
        ApiResponse.error(res, "ID inválido.", 400);
        return;
      }

      const user = await UserService.getById(id);
      ApiResponse.success(res, user);
    } catch (error: any) {
      ApiResponse.error(res, error.message, 404);
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const users = await UserService.getAll(limit);

      ApiResponse.success(res, { users, count: users.length });
    } catch (error: any) {
      ApiResponse.error(res, error.message, 500);
    }
  }

  static async getInactive(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getInactive();
      ApiResponse.success(res, users);
    } catch (error: any) {
      ApiResponse.error(res, error.message, 500);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, "ID inválido.", 400);
        return;
      }

      const validatedData = UpdateUserSchema.parse(req.body);
      await UserService.update(id, validatedData);

      ApiResponse.success(res, { message: "Dados atualizados com sucesso." });
    } catch (error: any) {
      if (error.issues) {
        ApiResponse.error(res, "Erro ao atualizar dados.", 400, error.format());
        return;
      }
      ApiResponse.error(res, error.message, 400);
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, "ID inválido.", 400);
        return;
      }

      await UserService.delete(id);
      ApiResponse.success(res, { message: "Usuário desativado com sucesso." });
    } catch (error: any) {
      ApiResponse.error(res, error.message, 400);
    }
  }
}
