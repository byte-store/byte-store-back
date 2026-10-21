import { pool } from "../config";
import { User, UserWithPassword } from "./users.entity";
import { UserRepository } from "./users.repository.interface";

export class PostgresUserRepository implements UserRepository {
  private client: typeof pool;

  constructor(client: typeof pool) {
    this.client = client;
  }

  // Traduce los datos de la BD al formato de tu Entidad TypeScript
  private toUser(row: any): User {
    return {
      id: Number(row.id),
      name: row.name, // Mapea full_name de la BD a 'name' de tu negocio
      email: row.email,
      role: row.role === "admin" ? "admin" : "user", // Ahora TS sabe con certeza que esto es "user" | "admin"
    };
  }

  async findAll(): Promise<User[]> {
    // Usamos ALIAS (AS) para mantener la compatibilidad con tu código externo
    const result = await this.client.query(
      "SELECT id, name , email, role FROM users",
    );
    return result.rows.map((row: any) => this.toUser(row));
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.client.query(
      "SELECT id, name , email, role FROM users WHERE id = $1",
      [Number(id)],
    );
    if (result.rows.length > 0) {
      return this.toUser(result.rows[0]);
    }
    return null;
  }

  async createUser(user: Omit<UserWithPassword, "id">): Promise<User> {
    const query = `
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, email, role
    `;

    // Mapeamos el rol de TS ('user'/'admin') al formato CHECK de Postgres ('CLIENTE'/'ADMIN')
    const dbRole = user.role === "admin" ? "admin" : "user";

    const values = [
      user.name,
      user.email,
      user.password, // El servicio envía 'password'
      dbRole,
    ];

    const result = await this.client.query(query, values);
    return this.toUser(result.rows[0]);
  }

  async updateUser(
    id: string,
    user: Partial<Omit<UserWithPassword, "id">>,
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Diccionario de traducción de propiedades TS -> Columnas SQL
    const fieldMapping: Record<string, string> = {
      name: "name",
      email: "email",
      password: "password_hash",
      role: "role",
    };

    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${paramCount}`);

        // Traducción especial de valores para el campo de Rol
        if (key === "role") {
          values.push(value === "admin" ? "admin" : "user");
        } else {
          values.push(value);
        }

        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findUserById(id);
    }

    values.push(Number(id));

    const query = `
      UPDATE users 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount} 
      RETURNING id, name, email, role
    `;

    const result = await this.client.query(query, values);

    if (result.rows.length > 0) {
      return this.toUser(result.rows[0]);
    }
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.client.query("DELETE FROM users WHERE id = $1", [
      Number(id),
    ]);
    return result.rowCount !== null && result.rowCount > 0;
  }
  async findByEmail(
    email: string,
  ): Promise<(User & { passwordHash: string }) | null> {
    const result = await this.client.query(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        ...this.toUser(row),
        passwordHash: row.password_hash,
      };
    }

    return null;
  }
}
