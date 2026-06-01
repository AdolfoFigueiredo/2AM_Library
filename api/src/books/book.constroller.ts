import { Request, Response } from "express";
import { BookService } from "./book.service.js";
import { CreateBookSchema, UpdateBookSchema } from "./book.dto.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class BookController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreateBookSchema.parse(req.body);
      const bookId = await BookService.create(validatedData);
      ApiResponse.success(res, { id: bookId }, 201);
    } catch (error: any) {
      if (error.issues) {
        ApiResponse.error(
          res,
          "Dados do livro inválidos.",
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
        ApiResponse.error(res, "ID do livro inválido.", 400);
        return;
      }
      const book = await BookService.getById(id);
      ApiResponse.success(res, book);
    } catch (error: any) {
      ApiResponse.error(res, error.message, 404);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, "ID inválido.", 400);
        return;
      }
      const validatedData = UpdateBookSchema.parse(req.body);
      await BookService.update(id, validatedData);
      ApiResponse.success(res, { message: "Livro atualizado com sucesso." });
    } catch (error: any) {
      if (error.issues) {
        ApiResponse.error(
          res,
          "Erro ao atualizar dados do livro.",
          400,
          error.format(),
        );
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
      await BookService.delete(id);
      ApiResponse.success(res, {
        message: "Livro removido do catálogo com sucesso.",
      });
    } catch (error: any) {
      ApiResponse.error(res, error.message, 400);
    }
  }

  static async getByISBN(req: Request, res: Response): Promise<void> {
    try {
      const { isbn }: any = req.params;
      const book = await BookService.getByISBN(isbn);
      ApiResponse.success(res, book, 200);
    } catch (error: any) {
      ApiResponse.error(res, error.message, 500);
    }
  }

  static async getTopSellings(req: Request, res: Response) {
    try {
      const books = await BookService.findTopSellings();
      ApiResponse.success(res, books, 200);
    } catch (error: any) {
      ApiResponse.error(res, error.message, 500);
    }
  }
}
