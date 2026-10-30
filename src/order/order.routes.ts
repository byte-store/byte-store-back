import { Router } from "express";
import { Pool } from "pg";
import { PostgresOrderRepository } from "./order.repository.postgres";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { verificarToken } from "../auth/auth.middleware";

export function buildOrderRouter(pool: Pool): Router {
  const repo = new PostgresOrderRepository(pool);
  const service = new OrderService(repo);
  const controller = new OrderController(service);

  const router = Router();
  router.post("/", verificarToken, controller.checkout);
  router.get("/", verificarToken, controller.list);
  return router;
}