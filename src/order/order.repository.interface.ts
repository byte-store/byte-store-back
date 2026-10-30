import { Order, OrderWithProducts, PaymentMethod } from "./order.entity";

export interface IOrderRepository {
  checkout(userId: number, paymentMethod: PaymentMethod): Promise<Order>;

  findByUserId(userId: number): Promise<OrderWithProducts[]>;
}