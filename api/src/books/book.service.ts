import { BookRepository } from "./book.repository.js";
import { CreateBookDto, BookFiltersDto, UpdateBookDto } from "./book.dto.js";

export class BookService {
  static async create(dto: CreateBookDto) {
    if (dto.isbn) {
      const existingBook = await BookRepository.getByIsbn(dto.isbn);
      if (existingBook) {
        throw new Error("Já existe um livro ativo cadastrado com este ISBN.");
      }
    }
    return await BookRepository.create(dto);
  }

  static async getById(id: number) {
    const book = await BookRepository.getById(id);
    if (!book) {
      throw new Error("Livro não encontrado ou desativado.");
    }
    return book;
  }

  static async getAll(limit?: number) {
    return await BookRepository.getAll(limit);
  }

  static async getByISBN(isbn: string) {
    return await BookRepository.getByIsbn(isbn);
  }

  static async findByFilters(filters: BookFiltersDto) {
    return await BookRepository.findByFilters(filters);
  }

  static async update(id: number, dto: UpdateBookDto) {
    await this.getById(id);
    return await BookRepository.update(id, dto);
  }

  static async delete(id: number) {
    await this.getById(id);
    return await BookRepository.softDelete(id);
  }
}
