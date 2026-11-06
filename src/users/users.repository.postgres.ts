import { Pool, QueryResultRow } from "pg";
import { User, UserWithPasswordHash } from "./users.entity";
import { IUserRepository, UserData } from "./users.repository.interface";
import {
  ConflictError,
  PG_FOREIGN_KEY_VIOLATION,
  PG_UNIQUE_VIOLATION,
} from "../shared/errors";

// Propiedades de la entidad -> columnas de la tabla users
const COLUMNS: Record<keyof UserData, string> = {
  name: "name",
  email: "email",
  passwordHash: "password_hash",
  role: "role",
};

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  private toEntity(row: QueryResultRow): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
    };
  }

  async findAll(): Promise<User[]> {
    const { rows } = await this.pool.query(
      "SELECT id, name, email, role FROM users ORDER BY id",
    );
    return rows.map((r) => this.toEntity(r));
  }

  async findUserById(id: number): Promise<User | null> {
    const { rows } = await this.pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [id],
    );
    return rows.length ? this.toEntity(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<UserWithPasswordHash | null> {
    const { rows } = await this.pool.query(
      "SELECT id, name, email, role, password_hash FROM users WHERE LOWER(email) = LOWER($1)",
      [email.trim()],
    );
    if (!rows.length) return null;
    return { ...this.toEntity(rows[0]), passwordHash: rows[0].password_hash };
  }

  async createUser(user: UserData): Promise<User> {
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role`,
        [user.name, user.email, user.passwordHash, user.role],
      );
      return this.toEntity(rows[0]);
    } catch (err: any) {
      if (err?.code === PG_UNIQUE_VIOLATION) {
        throw new ConflictError("El email ya está registrado");
      }
      throw err;
    }
  }

  async updateUser(id: number, user: Partial<UserData>): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, column] of Object.entries(COLUMNS)) {
      const value = user[key as keyof UserData];
      if (value !== undefined) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }
    }

    if (fields.length === 0) {
      return this.findUserById(id);
    }

    values.push(id);

    try {
      const { rows } = await this.pool.query(
        `UPDATE users
         SET ${fields.join(", ")}
         WHERE id = $${values.length}
         RETURNING id, name, email, role`,
        values,
      );
      return rows.length ? this.toEntity(rows[0]) : null;
    } catch (err: any) {
      if (err?.code === PG_UNIQUE_VIOLATION) {
        throw new ConflictError("El email ya está registrado");
      }
      throw err;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const { rowCount } = await this.pool.query(
        "DELETE FROM users WHERE id = $1",
        [id],
      );
      return (rowCount ?? 0) > 0;
    } catch (err: any) {
      if (err?.code === PG_FOREIGN_KEY_VIOLATION) {
        throw new ConflictError(
          "El usuario tiene órdenes asociadas y no se puede eliminar",
        );
      }
      throw err;
    }
  }
}
