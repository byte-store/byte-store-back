import { Response } from "express";
import { PG_MAX_INT, ValidationError } from "./errors";

export function parseId(raw: unknown, name: string): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > PG_MAX_INT) {
    throw new ValidationError(`${name} inválido`);
  }
  return n;
}

export function handleError(e: unknown, res: Response): void {
  const status = (e as any)?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({ message: (e as Error).message });
    return;
  }
  console.error(e);
  res.status(500).json({ message: "Error interno" });
}
