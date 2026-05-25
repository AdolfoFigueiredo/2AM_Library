import { UserRepository } from "./user.repository.js";
import { CreateUserDto, UpdateUserDto, SafeUserDto } from "./user.dto.js";

export class UserService {
  static async create(dto: CreateUserDto): Promise<number> {
    const existingUser = await UserRepository.getByEmail(dto.email);
    if (existingUser) {
      throw new Error("E-mail já cadastrado no sistema.");
    }

    return await UserRepository.create(dto as any);
  }

  static async getById(id: number): Promise<SafeUserDto> {
    const user = await UserRepository.getById(id);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }
    return user;
  }

  static async getAll(limit?: number): Promise<SafeUserDto[]> {
    return await UserRepository.getAll(limit);
  }

  static async update(id: number, dto: UpdateUserDto): Promise<boolean> {
    await this.getById(id);
    return await UserRepository.update(id, dto);
  }

  static async delete(id: number): Promise<boolean> {
    await this.getById(id);
    return await UserRepository.softDelete(id);
  }
}
