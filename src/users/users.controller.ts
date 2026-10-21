import { Request, Response } from "express";
import { UserService } from "./users.service";
import { UpdateUserDto } from "./users.entity";
import { AuthRequest } from "../auth/auth.middleware";
import { config } from "../config";
import { ForbiddenError } from "../shared/errors";
import { handleError, parseId } from "../shared/http";

export class UserController {
  constructor(private readonly service: UserService) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      res.json(await this.service.findAll());
    } catch (e) { handleError(e, res); }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.userId, "userId");
      res.json(await this.service.findUserById(id));
    } catch (e) { handleError(e, res); }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body ?? {};
      // Por esta ruta siempre se crea un 'user'
      const user = await this.service.createUser({ name, email, password, role: "user" });
      res.status(201).json(user);
    } catch (e) { handleError(e, res); }
  };

  createAdmin = async (req: Request, res: Response) => {
    try {
      const { name, email, password, secretKey } = req.body ?? {};

      if (!config.adminSecretKey) {
        throw new Error(
          "ADMIN_SECRET_KEY no está configurada en el .env. No se pueden crear administradores.",
        );
      }
      if (secretKey !== config.adminSecretKey) {
        throw new ForbiddenError("No tenés permiso para crear administradores");
      }

      const user = await this.service.createUser({ name, email, password, role: "admin" });
      res.status(201).json(user);
    } catch (e) { handleError(e, res); }
  };

  updateUser = async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.userId, "userId");
      const { name, email, password, role } = req.body ?? {};
      const userData: UpdateUserDto = { name, email, password };

      // Solo un admin puede cambiar roles
      if (role !== undefined) {
        if (req.usuario?.role !== "admin") {
          throw new ForbiddenError("No tenés permisos para cambiar el rol");
        }
        userData.role = role;
      }

      res.json(await this.service.updateUser(id, userData));
    } catch (e) { handleError(e, res); }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.userId, "userId");
      await this.service.deleteUser(id);
      res.json({ message: "Usuario eliminado correctamente" });
    } catch (e) { handleError(e, res); }
  };
}
