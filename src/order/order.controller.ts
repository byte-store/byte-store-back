import { Response } from "express";
import { OrderService } from "./order.service";
import { AuthRequest } from "../auth/auth.middleware";
import { handleError } from "../shared/http";

export class OrderController {
  constructor(private readonly service: OrderService) {}

  checkout = async (req: AuthRequest, res: Response) => {
    try {
      const { paymentMethod } = req.body ?? {};
      const order = await this.service.checkout(req.usuario!.id, { paymentMethod });
      res.status(201).json(order);
    } catch (e) { handleError(e, res); }
  };
  
  list = async (req: AuthRequest, res: Response) => {
    try {
      const orders = await this.service.getMyOrders(req.usuario!.id);
      res.json(orders);
    } catch (e) { handleError(e, res); }
  };
}