import { BookRepository } from "./book.repository.js";
import {
  CreateBookDto,
  GetBooksQuerySchema,
  GetBookSchema,
  UpdateBookDto,
} from "./book.dto.js";
import { BaseQueryPagination } from "../utils/dynamicFilter.js";

export class BookService {
  static async create(dto: CreateBookDto) {
    if (dto.isbn) {
      const existingBook = await BookRepository.findByIsbn(dto.isbn);
      if (existingBook) {
        throw new Error("Já existe um livro ativo cadastrado com este ISBN.");
      }
    }
    return await BookRepository.create(dto);
  }

  static async getById(id: number) {
    const book = await BookRepository.findById(id);
    if (!book) {
      throw new Error("Livro não encontrado ou desativado.");
    }
    return book;
  }

  static async getByISBN(isbn: string) {
    return await BookRepository.findByIsbn(isbn);
  }

  static async findTopSellings() {
    return await BookRepository.findTopSellingsBooks();
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
