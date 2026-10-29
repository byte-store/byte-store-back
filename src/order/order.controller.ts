import { Response } from "express";
import { OrderService } from "./order.service";
import { AuthRequest } from "../auth/auth.middleware";
import { handleError } from "../shared/http";

export class OrderController {
  constructor(private readonly service: OrderService) {}

  checkout = async (req: AuthRequest, res: Response) => {
    try {
      const order = await this.service.checkout(req.usuario!.id);
      res.status(201).json(order);
    } catch (e) { handleError(e, res); }
  };
}