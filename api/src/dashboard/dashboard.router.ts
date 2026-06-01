import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";

const router = Router();
// Rota para os cards de métricas e ranking de livros do ERP
router.get("/overview", DashboardController.getOverview);
// Rota para o relatório detalhado de faturamento/vendas
router.get("/sales-report", DashboardController.getSalesReport);

export { router as DashboardRoutes };
