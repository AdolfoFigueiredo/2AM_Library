import { Router } from "express";
import { BookController } from "./book.constroller.js";
import { validateBody } from "../middlewares/validate";
import { CreateBookSchema, UpdateBookSchema } from "./book.dto.js";

const router = Router();

router.post("/", validateBody(CreateBookSchema), BookController.create);
router.get("/", BookController.getAll);
router.get("/search/filter", BookController.getByFilters);
router.get("/:id", BookController.getById);
router.put("/:id", validateBody(UpdateBookSchema), BookController.update);
router.delete("/:id", BookController.delete);

export { router as BookRoutes };
