import { Pool, QueryResultRow } from "pg";
import { Product } from "./product.entity";
import { CreateProductDto } from "./product.dto";
import { IProductRepository } from "./product.repository.interface";
import {
  ConflictError,
  NotFoundError,
  PG_FOREIGN_KEY_VIOLATION,
} from "../shared/errors";

export class PostgresProductRepository implements IProductRepository {
  constructor(private readonly pool: Pool) {}

  private toEntity(row: QueryResultRow): Product {
    return {
      id: row.id,
      categoryId: row.category_id,
      brand: row.brand,
      model: row.model,
      description: row.description,
      // pg devuelve NUMERIC como string
      price: Number(row.price),
      stock: row.stock,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(): Promise<Product[]> {
    const { rows } = await this.pool.query(
      "SELECT * FROM products ORDER BY created_at DESC",
    );
    return rows.map((r) => this.toEntity(r));
  }

  async insert(data: CreateProductDto): Promise<Product> {
    try {
      const { rows } = await this.pool.query(
        `INSERT INTO products (category_id, brand, model, description, price, stock, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          data.categoryId,
          data.brand,
          data.model,
          data.description,
          data.price,
          data.stock,
          data.imageUrl,
        ],
      );
      return this.toEntity(rows[0]);
    } catch (err: any) {
      if (err?.code === PG_FOREIGN_KEY_VIOLATION) {
        throw new NotFoundError("La categoría no existe");
      }
      throw err;
    }
  }

  async deleteById(id: number): Promise<Product | null> {
    try {
      const { rows } = await this.pool.query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [id],
      );
      return rows.length ? this.toEntity(rows[0]) : null;
    } catch (err: any) {
      if (err?.code === PG_FOREIGN_KEY_VIOLATION) {
        throw new ConflictError(
          "El producto tiene órdenes asociadas y no se puede eliminar",
        );
      }
      throw err;
    }
  }
}
