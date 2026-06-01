import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export class CategoryController {
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = await CategoryService.create(req.body);
      ApiResponse.success(res, id, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const category = await CategoryService.getById(Number(id));
      ApiResponse.success(res, category);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { limit } = req.query;
      const categories = await CategoryService.getAll(Number(limit));
      ApiResponse.success(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const success = await CategoryService.update(Number(id), req.body);
      ApiResponse.success(res, success);
    } catch (error) {
      next(error);
    }
  }

  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const success = await CategoryService.delete(Number(id));
      ApiResponse.success(res, success);
    } catch (error) {
      next(error);
    }
  }
}
