import { Order } from "./order.entity";

export interface IOrderRepository {
  checkout(userId: number): Promise<Order>;
}