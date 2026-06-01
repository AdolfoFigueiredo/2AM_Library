import express, { Request, Response } from "express";
import cors from "cors";
import { ApiResponse } from "./src/utils/ApiResponse";
import { errorHandler } from "./src/middlewares/errorHandler";
import { healtCheck } from "./src/utils/healthCheck.js";
import { UserRoutes } from "./src/users/user.routes.js";
import { BookRoutes } from "./src/books/book.router.js";
import { saleRoutes } from "./src/sales/sale.route.js";
import { cartRoutes } from "./src/cart/cart.routes.js";
import { authRoutes } from "./src/auth/auth.routes";
import { inventoryRoutes } from "./src/inventory/inventory.router.js";
import { DashboardRoutes } from "./src/dashboard/dashboard.router.js";
import { CategoryRoutes } from "./src/categories/category.router.js";
import { SupplierRoutes } from "./src/suppliers/supplier.routes.js";
import { testDatabaseConnection } from "./src/config/db.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);

app.use("/api/users", UserRoutes);
app.use("/api/books", BookRoutes);
app.get("/api/health", healtCheck);
app.use("/api/sales", saleRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", SupplierRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/inventory", inventoryRoutes);

testDatabaseConnection();

app.get("/api/", (req: Request, res: Response) =>
  ApiResponse.success(res, { message: "API OK" }),
);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
