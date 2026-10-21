import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config, pool } from "../config";
import { PostgresUserRepository } from "../users/users.repository.postgres";

const userRepository = new PostgresUserRepository(pool);

export async function login(email: string, password: string) {
  const usuario = await userRepository.findByEmail(email);
  if (!usuario) throw new Error("Credenciales inválidas");

  const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordOk) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn, algorithm: "HS256" },
  );

  return token;
}
