import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "./ApiResponse";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    ApiResponse.error(res, "Erro de validação dos dados", 400, formattedErrors);
    return;
  }

  console.error(" [Global Error]:", err);

  ApiResponse.error(
    res,
    process.env.NODE_ENV === "production"
      ? "Erro interno do servidor"
      : err.message,
    500,
  );
};
