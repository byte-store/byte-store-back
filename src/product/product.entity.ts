export interface Product {
  id: number;
  categoryId: number | null;
  brand: string;
  model: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
