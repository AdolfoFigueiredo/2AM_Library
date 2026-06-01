import { Request, Response, Router } from "express";
import { SupplierController } from "./supplier.controller.js";
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
  CreateSupplierPhoneSchema,
} from "./supplier.dto.js";
import { validateBody } from "../middlewares/validate.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// --- Rotas Principais de Fornecedores ---

router.post(
  "/",
  authorize(["admin", "employee"]),
  validateBody(CreateSupplierSchema),
  (req: Request, res: Response) => SupplierController.create(req, res),
);

router.get("/:id", (req: Request, res: Response) =>
  SupplierController.getById(req, res),
);

router.get("/", (req: Request, res: Response) =>
  SupplierController.getAll(req, res),
);

router.put(
  "/:id",
  validateBody(UpdateSupplierSchema),
  (req: Request, res: Response) => SupplierController.update(req, res),
);

router.delete("/:id", authorize(["admin"]), (req: Request, res: Response) =>
  SupplierController.delete(req, res),
);

router.post(
  "/:id/phones",
  // validateBody(CreatePhoneSchema), // Descomenta se tiveres a validação Zod para o telefone
  (req: Request, res: Response) => SupplierController.addPhone(req, res),
);

export { router as SupplierRoutes };
