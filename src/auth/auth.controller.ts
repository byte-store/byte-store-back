import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ValidationError } from "../shared/errors";
import { handleError } from "../shared/http";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body ?? {};
      if (typeof email !== "string" || typeof password !== "string") {
        throw new ValidationError("Email y password son requeridos");
      }
      res.json({ token: await this.service.login(email, password) });
    } catch (e) { handleError(e, res); }
  };
}
