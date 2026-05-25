import { Response } from "express";

export class ApiResponse {
  /**
   * Resposta de Sucesso (200 OK, 201 Created, etc.)
   */
  static success<T>(
    res: Response,
    data: T,
    message = "Operação realizada com sucesso",
    statusCode = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Resposta de Erro Padronizada
   */
  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors: any = null,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date(),
    });
  }
}
