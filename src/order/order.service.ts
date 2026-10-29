import { IOrderRepository } from "./order.repository.interface";
import { Order } from "./order.entity";

export class OrderService {
  constructor(private readonly repo: IOrderRepository) {}

  async checkout(userId: number): Promise<Order> {
    return this.repo.checkout(userId);
  }
}