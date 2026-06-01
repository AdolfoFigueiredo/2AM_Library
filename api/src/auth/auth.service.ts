// src/auth/auth.service.ts
import bcrypt from "bcrypt";
import { pool } from "../config/db.js"; // ajuste o caminho se necessário
import { RegisterInput } from "./auth.dto.js";
import { TokenPayload } from "./auth.types";
import { UsersRole } from "../users/user.dto.js";
import { generateToken, generateRefreshToken } from "../utils/jwt";

export class AuthService {
  async register(data: RegisterInput) {
    const { firstName, lastName, email, password, taxId, ...optional } = data;

    // Verifica email existente
    const [existing] = await pool.execute(
      "SELECT id FROM Users WHERE email = ? AND deletedAt IS NULL",
      [email],
    );

    if ((existing as any[]).length > 0) {
      throw new Error("Este email já está cadastrado");
    }

    const possibleRole = password.slice(0, 2);
    let role = UsersRole.CUSTOMER;

    if (possibleRole === "MA") {
      role = UsersRole.MANAGER;
    } else if (possibleRole == "EM") {
      role = UsersRole.EMPLOYEE;
    } else {
      role = UsersRole.CUSTOMER;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result]: any = await pool.execute(
      `INSERT INTO Users (firstName, lastName, email, passwordHash, taxId, municipality, neighborhood, gender, birthDate, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email,
        passwordHash,
        taxId || null,
        optional.municipality || null,
        optional.neighborhood || null,
        optional.gender || null,
        optional.birthDate || null,
        role,
      ],
    );

    return {
      id: result.insertId,
      firstName,
      lastName,
      email,
      role,
    };
  }

  async login(email: string, password: string) {
    const [rows] = await pool.execute(
      `SELECT id, firstName, lastName, email, passwordHash, role 
       FROM Users 
       WHERE email = ? AND deletedAt IS NULL`,
      [email],
    );

    const user = (rows as any[])[0];
    if (!user) throw new Error("Credenciais inválidas");

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) throw new Error("Credenciais inválidas");

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
