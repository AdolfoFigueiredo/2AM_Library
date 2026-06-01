import { UserRepository } from "./user.repository.js";
import { CreateUserDto, UpdateUserDto, SafeUserDto } from "./user.dto.js";
import * as bcrypt from "bcrypt";

export class UserService {
  static async create(dto: CreateUserDto): Promise<number> {
    const existingUser = await UserRepository.getByEmail(dto.email);
    if (existingUser) {
      throw new Error("E-mail já cadastrado no sistema.");
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const { password, ...userData } = dto;
    const userToSave = {
      ...userData,
      passwordHash,
    };

    return await UserRepository.create(userToSave as any);
  }

  static async getById(id: number): Promise<SafeUserDto> {
    const user = await UserRepository.getById(id);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }
    return user;
  }

  static async getInactive() {
    return await UserRepository.getInactiveUsers();
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
