import { Product } from "./product.entity";
import { CreateProductDto } from "./product.dto";

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  insert(data: CreateProductDto): Promise<Product>;
  deleteById(id: number): Promise<Product | null>;
}
