import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UsersRole } from "../users/user.dto.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: typeof UsersRole | string;
  };
}

/**
 * Middleware para validar o Token JWT e o nível de acesso (Role)
 * @param allowedRoles Lista de papéis autorizados a aceder ao endpoint
 */
export const authorize = (allowedRoles: (typeof UsersRole | string)[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Acesso negado. Token não fornecido.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    try {
      const decoded = jwt.verify(
        token,
        secret!,
      ) as AuthenticatedRequest["user"];

      req.user = decoded;

      if (!req.user || !allowedRoles.includes(req.user.role)) {
        ApiResponse.error(
          res,
          "Acesso proibido. Não tens a permissão necessária para este recurso.",
          403,
        );
        return;
      }

      next();
    } catch (error) {
      ApiResponse.error(
        res,
        "Sessão inválida ou expirada. Inicie sessão novamente.",
        401,
      );
    }
  };
};
