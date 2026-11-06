import { Router } from "express";
import { Pool } from "pg";
import { PostgresUserRepository } from "./users.repository.postgres";
import { UserService } from "./users.service";
import { UserController } from "./users.controller";
import {
  verificarToken,
  requiereRol,
  verificarPropietario,
} from "../auth/auth.middleware";

export function buildUserRouter(pool: Pool): Router {
  const repo = new PostgresUserRepository(pool);
  const service = new UserService(repo);
  const controller = new UserController(service);

  const router = Router();
  router.post("/admin", controller.createAdmin);
  router.post("/", controller.createUser);
  router.get("/", verificarToken, requiereRol("admin"), controller.getAll);
  router.get(
    "/:userId",
    verificarToken,
    verificarPropietario,
    controller.getById,
  );
  router.put(
    "/:userId",
    verificarToken,
    verificarPropietario,
    controller.updateUser,
  );
  router.delete(
    "/:userId",
    verificarToken,
    verificarPropietario,
    controller.deleteUser,
  );
  return router;
}
