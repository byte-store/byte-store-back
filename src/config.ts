import "dotenv/config";
import { SignOptions } from "jsonwebtoken";
import { Pool } from "pg";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno "${key}". Revisá tu archivo .env (ver .env.example).`,
    );
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ||
    "1h") as SignOptions["expiresIn"],
  // Opcional: si no está, no se pueden crear administradores
  adminSecretKey: process.env.ADMIN_SECRET_KEY,
};

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
});
