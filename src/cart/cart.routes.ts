import { Router } from "express";
import { Pool } from "pg";
import { PostgresCartRepository } from "./cart.repository.postgres";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { verificarToken, verificarPropietario } from "../auth/auth.middleware";

export function buildCartRouter(pool: Pool): Router {
  const repo = new PostgresCartRepository(pool);
  const service = new CartService(repo);
  const controller = new CartController(service);

  const router = Router();
  router.get(
    "/:userId",
    verificarToken,
    verificarPropietario,
    controller.getCart,
  );
  router.post(
    "/:userId/items",
    verificarToken,
    verificarPropietario,
    controller.addItem,
  );
  router.patch(
    "/:userId/items/:productId",
    verificarToken,
    verificarPropietario,
    controller.updateItem,
  );
  router.delete(
    "/:userId/items/:productId",
    verificarToken,
    verificarPropietario,
    controller.removeItem,
  );
  router.delete(
    "/:userId/items",
    verificarToken,
    verificarPropietario,
    controller.clearCart,
  );
  return router;
}
