import { Response } from "express";

export class ApiResponse {
  /**
   * Resposta padronizada para operações bem-sucedidas.
   * @param res Objeto Response do Express
   * @param data Dados que serão retornados (objeto, array, etc.)
   * @param statusCode Código HTTP de status (padrão: 200)
   */
  static success(
    res: Response,
    data: any = null,
    statusCode: number = 200,
  ): void {
    res.status(statusCode).json({
      success: true,
      data,
      timeStamp: Date.now(),
    });
  }

  /**
   * Resposta padronizada para falhas e erros.
   * @param res Objeto Response do Express
   * @param message Mensagem de erro principal
   * @param statusCode Código HTTP de erro (padrão: 400)
   * @param errors Detalhes adicionais (como os erros de validação do Zod)
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors: any = null,
  ): void {
    res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
      timeStamp: Date.now(),
    });
  }
}
