import express, { Application, NextFunction, Request, Response } from "express";
import { Pool } from "pg";
import { config } from "./config";
import { buildAuthRouter } from "./auth/auth.routes";
import { buildProductRouter } from "./product/product.routes";
import { buildUserRouter } from "./users/users.routes";
import { buildCartRouter } from "./cart/cart.routes";
import { handleError } from "./shared/http";
import { buildOrderRouter } from "./order/order.routes";

export class App {
  public readonly app: Application;

  constructor(pool: Pool) {
    this.app = express();
    this.app.use(express.json());

    this.app.use("/api/auth", buildAuthRouter(pool));
    this.app.use("/api/products", buildProductRouter(pool));
    this.app.use("/api/users", buildUserRouter(pool));
    this.app.use("/api/carts", buildCartRouter(pool));
    this.app.use("/api/orders", buildOrderRouter(pool));
    
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({ message: "Ruta no encontrada" });
    });

    this.app.use(
      (err: unknown, _req: Request, res: Response, _next: NextFunction) =>
        handleError(err, res),
    );
  }

  public start() {
    this.app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  }
}
