// src/modules/auth/types.ts
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: "customer" | "employee" | "manager";
  taxId?: string;
  municipality?: string;
  neighborhood?: string;
  gender?: "M" | "F";
  birthDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}
