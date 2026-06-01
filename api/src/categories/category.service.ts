import { CategoryRepository } from "./category.repository.js";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto,
} from "./category.dto.js";

export class CategoryService {
  static async create(dto: CreateCategoryDto): Promise<number> {
    const existingCategory = await CategoryRepository.getByName(dto.name);
    if (existingCategory) {
      throw new Error("Já existe uma categoria cadastrada com este nome.");
    }

    return await CategoryRepository.create(dto);
  }

  static async getById(id: number): Promise<CategoryDto> {
    const category = await CategoryRepository.getById(id);
    if (!category) {
      throw new Error("Categoria não encontrada.");
    }
    return category;
  }

  static async getAll(limit?: number): Promise<CategoryDto[]> {
    return await CategoryRepository.getAll(limit);
  }

  static async update(id: number, dto: UpdateCategoryDto): Promise<boolean> {
    // Garante que a categoria existe antes de atualizar
    await this.getById(id);

    // Se estiver tentando alterar o nome, verifica se já não existe outra com o novo nome
    if (dto.name) {
      const existingCategory = await CategoryRepository.getByName(dto.name);
      if (existingCategory && existingCategory.id !== id) {
        throw new Error("Já existe outra categoria cadastrada com este nome.");
      }
    }

    return await CategoryRepository.update(id, dto);
  }

  static async delete(id: number): Promise<boolean> {
    // Garante que a categoria existe antes de remover
    await this.getById(id);
    return await CategoryRepository.softDelete(id);
  }
}
