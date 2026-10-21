// src/auth/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthRequest extends Request {
  usuario?: {
    id: string;
    email: string;
    role: string;
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

  if (String(req.usuario?.id) !== req.params.userId) {
    return res
      .status(403)
      .json({ mensaje: "No podés operar sobre este recurso" });
  }
  next();
}

export function requiereRol(rolPermitido: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.usuario?.role !== rolPermitido) {
      return res
        .status(403)
        .json({ mensaje: "No tenés permisos para esta acción" });
    }
    next();
  };
}

export function verificarToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ mensaje: "Token inválido o expirado" });
    }
    req.usuario = decoded as AuthRequest["usuario"];
    next();
  });
}
