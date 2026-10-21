import { Router } from "express";
import { Pool } from "pg";
import { PostgresProductRepository } from "./product.repository.postgres";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { verificarToken, requiereRol } from "../auth/auth.middleware";

export function buildProductRouter(pool: Pool): Router {
  const repo = new PostgresProductRepository(pool);
  const service = new ProductService(repo);
  const controller = new ProductController(service);

  const router = Router();
  router.get("/", controller.getAll);
  router.post("/", verificarToken, requiereRol("admin"), controller.create);
  router.delete("/:id", verificarToken, requiereRol("admin"), controller.delete);
  return router;
}
