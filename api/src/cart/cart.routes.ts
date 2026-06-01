import { Router } from "express";
import { CartController } from "./cart.controller.js";
import { AddToCartSchema } from "./cart.dto.js";
import { validateBody } from "../middlewares/validate.js"; // Ajusta o caminho se necessário
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// E-commerce: Obter o carrinho do cliente ativo
router.get("/", authorize(["customer"]), CartController.getCart);

// E-commerce: Adicionar ou atualizar quantidade de um livro no carrinho
router.post(
  "/items",
  authorize(["customer"]),
  validateBody(AddToCartSchema),
  CartController.addItem,
);

// E-commerce: Remover um item do carrinho pelo ID do registo
router.delete("/items/:id", authorize(["customer"]), CartController.removeItem);

export { router as cartRoutes };
