export interface CreateProductDto {
  categoryId: number | null;
  brand: string;
  model: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
}
