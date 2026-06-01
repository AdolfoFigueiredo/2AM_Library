import { SupplierRepository } from "./supplier.repository.js";
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierDto,
} from "./supplier.dto.js";
import { extname } from "node:path";

export class SupplierService {
  static async getAll(limit: number = 50) {
    return await SupplierRepository.findAll(limit);
  }

  static async getById(id: number) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) {
      throw new Error("Fornecedor não encontrado.");
    }

    // 💡 Busca os telefones e anexa ao objeto de resposta
    const phones = await SupplierRepository.findPhonesBySupplierId(id);

    return {
      ...supplier,
      phones: phones,
    };
  }

  static async findUnique(taxId: string, name: string) {
    return await SupplierRepository.findUnique(name, taxId);
  }

  static async getByTaxId(taxId: string) {
    return await SupplierRepository.findByTaxId(taxId);
  }

  static async create(dto: CreateSupplierDto) {
    const uniqueSupplier = await SupplierRepository.findUnique(
      dto.name,
      dto.taxId,
    );
    if (uniqueSupplier) throw new Error("Nome ou BI/NIF já registrados");

    return await SupplierRepository.create(dto);
  }

  static async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) throw new Error("Usuário não encontrado");

    return await SupplierRepository.update(id, dto);
  }

  static async delete(id: number) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) throw new Error("Fornecedor não existente");
    return await SupplierRepository.softDelete(id);
  }

  static async addPhone(supplierId: number, phone: string) {
    const supplier = await SupplierRepository.findById(supplierId);
    if (!supplier) {
      throw new Error(
        "Não é possível adicionar o contacto: Fornecedor não encontrado.",
      );
    }
    const phoneId = await SupplierRepository.addPhone(supplierId, phone);
    return { id: phoneId, supplierId, phone };
  }
}
