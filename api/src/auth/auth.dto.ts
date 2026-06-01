// src/auth/auth.dto.ts
import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  taxId: z.string().optional(),
  municipality: z.string().optional(),
  neighborhood: z.string().optional(),
  gender: z.enum(["M", "F"]).optional(),
  birthDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.string().date().optional()),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
