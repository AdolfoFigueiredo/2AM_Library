import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateBody = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      // O Zod parseia e limpa o req.body (remove campos injetados que não estão no schema)
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Retorna HTTP 400 estruturado com os erros de validação do Zod
        return res.status(400).json({
          status: "error",
          message: "Falha na validação dos dados enviados.",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      return res.status(500).json({ message: "Erro interno na validação." });
    }
  };
};
