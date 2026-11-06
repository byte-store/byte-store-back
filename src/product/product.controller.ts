import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { handleError, parseId } from "../shared/http";

export class ProductController {
  constructor(private readonly service: ProductService) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      res.json(await this.service.getAll());
    } catch (e) { handleError(e, res); }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { categoryId, brand, model, description, price, stock, imageUrl } =
        req.body ?? {};
      const product = await this.service.create({
        categoryId: categoryId ?? null,
        brand,
        model,
        description: description ?? null,
        price,
        stock,
        imageUrl: imageUrl ?? null,
      });
      res.status(201).json(product);
    } catch (e) { handleError(e, res); }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id, "id");
      const { categoryId, brand, model, description, price, stock, imageUrl } =
        req.body ?? {};
      const product = await this.service.update(id, {
        categoryId,
        brand,
        model,
        description,
        price,
        stock,
        imageUrl,
      });
      res.json(product);
    } catch (e) { handleError(e, res); }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id, "id");
      const product = await this.service.delete(id);
      res.json({ message: "Producto eliminado correctamente", product });
    } catch (e) { handleError(e, res); }
  };
}
