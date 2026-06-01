import { Router } from "express";
import { UserController } from "./user.controller.js";
import { CreateUserSchema, UpdateUserSchema } from "./user.dto.js";
import { validateBody } from "../middlewares/validate.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", validateBody(CreateUserSchema), UserController.create);
router.get("/", authorize(["admin"]), UserController.getAll);
router.get(
  "/inactive",
  authorize(["admin", "employee"]),
  UserController.getInactive,
);
router.get("/:id", UserController.getById);
router.put("/:id", validateBody(UpdateUserSchema), UserController.update);
router.delete("/:id", authorize(["admin", "customer"]), UserController.delete);

export { router as UserRoutes };
