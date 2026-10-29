export type OrderStatus = "COMPLETED" | "CANCELLED";

// Medios de pago aceptados (pago simulado). Tiene que coincidir con el CHECK de init.sql.
export const PAYMENT_METHODS = ["MERCADO_PAGO", "NARANJA_X", "TARJETA"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

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
  paymentMethod: PaymentMethod;
  createdAt: Date;
  items: OrderItem[];
}