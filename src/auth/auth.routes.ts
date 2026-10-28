import { Router } from "express";
import { Pool } from "pg";
import { PostgresUserRepository } from "../users/users.repository.postgres";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

export function buildAuthRouter(pool: Pool): Router {
  const repo = new PostgresUserRepository(pool);
  const service = new AuthService(repo);
  const controller = new AuthController(service);

  const router = Router();
  router.post("/login", controller.login);
  return router;
}
