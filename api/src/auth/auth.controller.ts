// src/auth/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.dto.js";
import { ApiResponse } from "../utils/ApiResponse";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      ApiResponse.success(
        res,
        { message: "Usuário criado com sucesso", user: result },
        201,
      );
    } catch (error: any) {
      ApiResponse.error(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password);
      ApiResponse.success(res, result);
    } catch (error: any) {
      ApiResponse.error(res, error.message, 400);
    }
  }
}

export const authController = new AuthController();
