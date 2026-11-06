import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { handleError, parseId } from '../shared/http';

export class CartController {
  constructor(private readonly service: CartService) {}

  getCart = async (req: Request, res: Response) => {
    try {
      const userId = parseId(req.params.userId, 'userId');
      res.json(await this.service.getCart(userId));
    } catch (e) { handleError(e, res); }
  };

  addItem = async (req: Request, res: Response) => {
    try {
      const userId = parseId(req.params.userId, 'userId');
      const { productId, quantity } = req.body ?? {};
      res.status(201).json(await this.service.addItem(userId, { productId, quantity }));
    } catch (e) { handleError(e, res); }
  };

  updateItem = async (req: Request, res: Response) => {
    try {
      const userId = parseId(req.params.userId, 'userId');
      const productId = parseId(req.params.productId, 'productId');
      const { quantity } = req.body ?? {};
      res.json(await this.service.updateItem(userId, productId, { quantity }));
    } catch (e) { handleError(e, res); }
  };

  removeItem = async (req: Request, res: Response) => {
    try {
      const userId = parseId(req.params.userId, 'userId');
      const productId = parseId(req.params.productId, 'productId');
      res.json(await this.service.removeItem(userId, productId));
    } catch (e) { handleError(e, res); }
  };

  clearCart = async (req: Request, res: Response) => {
    try {
      const userId = parseId(req.params.userId, 'userId');
      res.json(await this.service.clearCart(userId));
    } catch (e) { handleError(e, res); }
  };
}