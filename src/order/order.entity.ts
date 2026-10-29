export type OrderStatus = "COMPLETED" | "CANCELLED";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  items: OrderItem[];
}