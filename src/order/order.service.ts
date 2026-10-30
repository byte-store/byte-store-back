import { IOrderRepository } from "./order.repository.interface";
import { Order, OrderWithProducts, PAYMENT_METHODS, PaymentMethod } from "./order.entity";
import { CheckoutDto } from "./order.dto";
import { ValidationError } from "../shared/errors";

export class OrderService {
  constructor(private readonly repo: IOrderRepository) {}

  async checkout(userId: number, dto: CheckoutDto): Promise<Order> {
    if (!PAYMENT_METHODS.includes(dto.paymentMethod as PaymentMethod)) {
      throw new ValidationError(
        `paymentMethod es obligatorio y debe ser uno de: ${PAYMENT_METHODS.join(", ")}`,
      );
    }
    return this.repo.checkout(userId, dto.paymentMethod);
  }

  async getMyOrders(userId: number): Promise<OrderWithProducts[]> {
    return this.repo.findByUserId(userId);
  }
}