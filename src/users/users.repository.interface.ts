import { User, UserWithPasswordHash } from "./users.entity";

export type UserData = Omit<UserWithPasswordHash, "id">;

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findUserById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<UserWithPasswordHash | null>;
  createUser(user: UserData): Promise<User>;
  updateUser(id: number, user: Partial<UserData>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
}
