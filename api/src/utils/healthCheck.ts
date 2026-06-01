import { Request, Response } from "express";
import { testDatabaseConnection } from "../config/db.js";
import { ApiResponse } from "./ApiResponse.js"; // Garantindo o import da sua classe

export async function healtCheck(req: Request, res: Response) {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

  let dbStatus = "UP";

  const isConnected = await testDatabaseConnection();

  if (!isConnected) {
    dbStatus = "DOWN";
  }

  const healthInfo = {
    status: dbStatus === "UP" ? "OK" : "ERROR",
    uptime: `${Math.floor(uptime)}s`,
    memory: `${memoryUsage.toFixed(2)} MB`,
    services: {
      database: dbStatus,
    },
  };

  const statusCode = dbStatus === "UP" ? 200 : 503;

  return ApiResponse.success(res, healthInfo, statusCode);
}
