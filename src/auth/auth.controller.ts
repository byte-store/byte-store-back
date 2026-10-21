import { Request, Response } from "express";
import { login } from "./auth.service";

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Email y password son requeridos" });
  }

  try {
    const token = await login(email, password);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ mensaje: "Credenciales inválidas" });
  }
}
