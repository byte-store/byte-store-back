export type Role = "user" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserWithPasswordHash extends User {
  passwordHash: string;
}

// Datos que llegan desde la API (password en texto plano)
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export type UpdateUserDto = Partial<CreateUserDto>;
