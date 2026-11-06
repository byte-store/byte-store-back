import { Product } from "./product.entity";
import { CreateProductDto, UpdateProductDto } from "./product.dto";

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  insert(data: CreateProductDto): Promise<Product>;
  updateById(id: number, data: UpdateProductDto): Promise<Product | null>;
  deleteById(id: number): Promise<Product | null>;
}
