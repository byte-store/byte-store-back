export interface CreateProductDto {
  categoryId: number | null;
  brand: string;
  model: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
}

// Solo se actualizan los campos que vienen definidos
export type UpdateProductDto = Partial<CreateProductDto>;
