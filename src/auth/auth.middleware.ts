import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { Role } from "../users/users.entity";

export interface AuthRequest extends Request {
  usuario?: {
    id: number;
    email: string;
    role: Role;
  };
}

export function verificarPropietario(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.usuario?.role === "admin") {
    return next();
  }

  if (req.usuario?.id !== Number(req.params.userId)) {
    return res
      .status(403)
      .json({ message: "No podés operar sobre este recurso" });
  }
  next();
}

export function requiereRol(rolPermitido: Role) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.usuario?.role !== rolPermitido) {
      return res
        .status(403)
        .json({ message: "No tenés permisos para esta acción" });
    }
    next();
  };
}

export function verificarToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const [scheme, token] = (req.headers["authorization"] ?? "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(
    token,
    config.jwtSecret,
    { algorithms: ["HS256"] },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token inválido o expirado" });
      }
      req.usuario = decoded as AuthRequest["usuario"];
      next();
    },
  );
}
