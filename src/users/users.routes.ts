import { Router, Request, Response } from "express";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { PostgresUserRepository } from "./users.repository.postgres";
import { pool } from "../config";
import {
  verificarToken,
  requiereRol,
  verificarPropietario,
} from "../auth/auth.middleware";

const router = Router();

const userRepository = new PostgresUserRepository(pool);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("/admin", (req, res) => userController.createAdmin(req, res));
router.post("/", (req, res) => userController.createUser(req, res));
router.get("/", verificarToken, requiereRol("admin"), (req, res) =>
  userController.getAll(req, res),
);

router.get(
  "/:userId",
  verificarToken,
  verificarPropietario,
  (req: Request<{ userId: string }>, res: Response) =>
    userController.getById(req, res),
);

router.put(
  "/:userId",
  verificarToken,
  verificarPropietario,
  (req: Request<{ userId: string }>, res: Response) =>
    userController.updateUser(req, res),
);

router.delete(
  "/:userId",
  verificarToken,
  verificarPropietario,
  (req: Request<{ userId: string }>, res: Response) =>
    userController.deleteUser(req, res),
);

export default router;
