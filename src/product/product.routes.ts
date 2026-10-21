import { Router } from "express";
import { ProductController } from "./product.controller";
import { verificarToken, requiereRol } from "../auth/auth.middleware";

const router = Router();
const productController = new ProductController();

router.get("/", productController.getAll);
router.post(
  "/",
  verificarToken,
  requiereRol("admin"),
  productController.create,
);
router.delete(
  "/:id",
  verificarToken,
  requiereRol("admin"),
  productController.delete,
);

export default router;
