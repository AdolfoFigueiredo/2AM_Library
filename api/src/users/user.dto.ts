import { z } from "zod";

export enum Gender {
  MALE = "M",
  FEMALE = "F",
}

export enum UsersRole {
  MANAGER = "manager",
  EMPLOYEE = "employee",
  CUSTOMER = "customer",
}

export const UserSchema = z.object({
  id: z.number().positive().int(),
  firstName: z.string().min(3, "Nome deve ter pelo menos 3 catacteres"),
  lastName: z.string().min(3, "Nome deve ter pelo menos 3 catacteres"),
  email: z.email(),
  passwordHash: z.string().min(8, "Password deve ter pelo menos 8 catacteres"),
  taxId: z.string().min(11, "BI/NIF deve ter  11 caracters"),
  municipality: z.string(),
  neighborhood: z.string(),
  gender: z.enum(Gender),
  birthDate: z.coerce.date(),
  role: z.enum(UsersRole) || UsersRole.CUSTOMER,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  passwordHash: true,
}).extend({
  password: z.string().min(8, "Password deve ter pelo menos 8 caracteres"),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ role: true });

export const SafeUserSchema = UserSchema.omit({
  passwordHash: true,
  updatedAt: true,
});

export type UserDto = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type SafeUserDto = z.infer<typeof SafeUserSchema>;
