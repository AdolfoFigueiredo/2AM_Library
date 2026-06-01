// src/auth/auth.routes.ts
import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export { router as authRoutes };
