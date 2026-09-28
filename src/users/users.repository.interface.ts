import { User, UserWithPassword } from "./users.entity";

export interface UserRepository {
  findAll(): Promise<User[]>;
  findUserById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  createUser(user: Omit<UserWithPassword, "id">): Promise<User>;
  updateUser(
    id: string,
    user: Partial<Omit<UserWithPassword, "id">>,
  ): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
}
