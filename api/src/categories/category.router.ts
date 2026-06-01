import { Router } from "express";
import { CategoryController } from "./category.controller.js";
import { CreateCategorySchema, UpdateCategorySchema } from "./category.dto.js";
import { validateBody } from "../middlewares/validate.js";

const router = Router();

router.post("/", validateBody(CreateCategorySchema), CategoryController.create);
router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);
router.put(
  "/:id",
  validateBody(UpdateCategorySchema),
  CategoryController.update,
);
router.delete("/:id", CategoryController.delete);

export { router as CategoryRoutes };
