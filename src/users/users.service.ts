import bcrypt from "bcrypt";
import { IUserRepository, UserData } from "./users.repository.interface";
import { CreateUserDto, UpdateUserDto, User } from "./users.entity";
import { NotFoundError, ValidationError } from "../shared/errors";

const SALT_ROUNDS = 10;
const VALID_ROLES = ["user", "admin"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Largos máximos según las columnas de init.sql
const NAME_MAX = 150;
const EMAIL_MAX = 150;
const PASSWORD_MIN = 8;

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findUserById(id);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    return user;
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    userData = this.normalize(userData);
    this.validateUserData(userData);
    const { password, ...rest } = userData;
    return this.userRepository.createUser({
      ...rest,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    });
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    userData = this.normalize(userData);
    this.validateUserData(userData, true);
    const { password, ...rest } = userData;
    const changes: Partial<UserData> = rest;
    if (password !== undefined) {
      changes.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const user = await this.userRepository.updateUser(id, changes);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    const deleted = await this.userRepository.deleteUser(id);
    if (!deleted) throw new NotFoundError("Usuario no encontrado");
  }

  // Los emails se guardan en minúsculas para que no haya duplicados por mayúsculas
  private normalize<T extends UpdateUserDto>(userData: T): T {
    if (typeof userData.email !== "string") return userData;
    return { ...userData, email: userData.email.trim().toLowerCase() };
  }

  private validateUserData(userData: UpdateUserDto, isUpdate = false): void {
    const { name, email, password, role } = userData;

    if (!isUpdate || name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 3) {
        throw new ValidationError(
          "El nombre de usuario debe tener al menos 3 caracteres.",
        );
      }
      if (name.length > NAME_MAX) {
        throw new ValidationError(
          `El nombre no puede superar los ${NAME_MAX} caracteres.`,
        );
      }
    }

    if (!isUpdate || email !== undefined) {
      if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
        throw new ValidationError(
          "El formato del correo electrónico no es válido.",
        );
      }
      if (email.length > EMAIL_MAX) {
        throw new ValidationError(
          `El email no puede superar los ${EMAIL_MAX} caracteres.`,
        );
      }
    }

    if (!isUpdate || password !== undefined) {
      if (typeof password !== "string" || password.length < PASSWORD_MIN) {
        throw new ValidationError(
          `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`,
        );
      }
    }

    if (!isUpdate || role !== undefined) {
      if (typeof role !== "string" || !VALID_ROLES.includes(role)) {
        throw new ValidationError("El rol debe ser 'user' o 'admin'.");
      }
    }
  }
}
