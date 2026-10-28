import { IProductRepository } from "./product.repository.interface";
import { Product } from "./product.entity";
import { CreateProductDto, UpdateProductDto } from "./product.dto";
import { NotFoundError, PG_MAX_INT, ValidationError } from "../shared/errors";

// Límites según las columnas de init.sql
const BRAND_MAX = 80;
const MODEL_MAX = 120;
const IMAGE_URL_MAX = 255;
const PRICE_MAX = 9_999_999_999.99; // NUMERIC(12, 2)

export class ProductService {
  constructor(private readonly repo: IProductRepository) {}

  async getAll(): Promise<Product[]> {
    return this.repo.findAll();
  }

  async create(data: CreateProductDto): Promise<Product> {
    this.validate(data);
    return this.repo.insert(data);
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    if (Object.values(data).every((v) => v === undefined)) {
      throw new ValidationError("No se envió ningún campo para actualizar");
    }
    this.validate(data, true);
    const updated = await this.repo.updateById(id, data);
    if (!updated) throw new NotFoundError(`No existe un producto con id ${id}`);
    return updated;
  }

  async delete(id: number): Promise<Product> {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) throw new NotFoundError(`No existe un producto con id ${id}`);
    return deleted;
  }

  // En un update solo se validan los campos que vienen definidos
  private validate(data: UpdateProductDto, isUpdate = false): void {
    const { categoryId, brand, model, description, price, stock, imageUrl } = data;

    if (!isUpdate || brand !== undefined) {
      if (typeof brand !== "string" || brand.trim().length === 0 || brand.length > BRAND_MAX) {
        throw new ValidationError(`brand es obligatorio (máximo ${BRAND_MAX} caracteres)`);
      }
    }
    if (!isUpdate || model !== undefined) {
      if (typeof model !== "string" || model.trim().length === 0 || model.length > MODEL_MAX) {
        throw new ValidationError(`model es obligatorio (máximo ${MODEL_MAX} caracteres)`);
      }
    }
    if (!isUpdate || price !== undefined) {
      if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > PRICE_MAX) {
        throw new ValidationError(`price debe ser un número entre 0 y ${PRICE_MAX}`);
      }
    }
    if (!isUpdate || stock !== undefined) {
      if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0 || stock > PG_MAX_INT) {
        throw new ValidationError(`stock debe ser entero entre 0 y ${PG_MAX_INT}`);
      }
    }
    if (categoryId !== undefined && categoryId !== null) {
      if (!Number.isInteger(categoryId) || categoryId < 1 || categoryId > PG_MAX_INT) {
        throw new ValidationError("categoryId debe ser un id válido o null");
      }
    }
    if (description !== undefined && description !== null && typeof description !== "string") {
      throw new ValidationError("description debe ser texto o null");
    }
    if (
      imageUrl !== undefined &&
      imageUrl !== null &&
      (typeof imageUrl !== "string" || imageUrl.length > IMAGE_URL_MAX)
    ) {
      throw new ValidationError(`imageUrl debe ser texto (máximo ${IMAGE_URL_MAX} caracteres) o null`);
    }
  }
}
