import { Order, PaymentMethod } from "./order.entity";

export interface IOrderRepository {
  checkout(userId: number, paymentMethod: PaymentMethod): Promise<Order>;
}