import { Router } from "express";
import { InventoryController } from "./inventory.controller.js";
import { ReplenishStockSchema } from "./inventory.dto.js";
import { validateBody } from "../middlewares/validate.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// ERP: Listar alertas de stock baixo/crítico
router.get(
  "/low-stock",
  authorize(["admin", "employee"]),
  InventoryController.getLowStockAlerts,
);

// ERP: Dar entrada/reabastecimento de mercadoria no stock
router.post(
  "/replenish",
  authorize(["admin", "employee"]),
  validateBody(ReplenishStockSchema),
  InventoryController.replenish,
);

export { router as inventoryRoutes };
