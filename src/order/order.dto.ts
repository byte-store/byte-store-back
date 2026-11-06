import { PaymentMethod } from "./order.entity";

export interface CheckoutDto {
  paymentMethod: PaymentMethod;
}