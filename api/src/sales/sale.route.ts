import { Router } from "express";
import { SaleController } from "./sale.controller.js";
import { ProcessSaleSchema } from "./sale.dto.js";
import { validateBody } from "../middlewares/validate.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Rota de Checkout do E-commerce (Chama a Stored Procedure)
router.post(
  "/checkout",
  authorize(["customer"]),
  validateBody(ProcessSaleSchema),
  SaleController.checkout,
);

// Rotas Administrativas do ERP
router.get("/", authorize(["admin", "employee"]), SaleController.getAll);
router.get(
  "/:id",
  authorize(["customer", "admin", "employee"]),
  SaleController.getById,
);
router.patch(
  "/:id/status",
  authorize(["admin", "employee"]),
  SaleController.changeStatus,
);

export { router as saleRoutes };
