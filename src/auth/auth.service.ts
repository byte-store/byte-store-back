import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { IUserRepository } from "../users/users.repository.interface";
import { UnauthorizedError } from "../shared/errors";

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async login(email: string, password: string): Promise<string> {
    const usuario = await this.userRepository.findByEmail(email);
    if (!usuario) throw new UnauthorizedError("Credenciales inválidas");

    const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordOk) throw new UnauthorizedError("Credenciales inválidas");

    return jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn, algorithm: "HS256" },
    );
  }
}
