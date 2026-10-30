import { Pool, PoolClient, QueryResultRow } from "pg";
import {
  Order,
  OrderItem,
  OrderItemDetail,
  OrderWithProducts,
  PaymentMethod,
} from "./order.entity";
import { IOrderRepository } from "./order.repository.interface";
import { ConflictError, ValidationError } from "../shared/errors";

export class PostgresOrderRepository implements IOrderRepository {
  constructor(private readonly pool: Pool) {}

  private toItem(row: QueryResultRow): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
    };
  }

  private toOrder<T extends OrderItem>(
    row: QueryResultRow,
    items: T[],
  ): Omit<Order, "items"> & { items: T[] } {
    return {
      id: row.id,
      userId: row.user_id,
      totalAmount: Number(row.total_amount),
      status: row.status,
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
      items,
    };
  }

  async checkout(userId: number, paymentMethod: PaymentMethod): Promise<Order> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const { rows: lines } = await client.query(
        `SELECT ci.id AS cart_item_id, ci.product_id, ci.quantity,
                p.stock, p.brand, p.model
           FROM cart_items ci
           JOIN products p ON p.id = ci.product_id
          WHERE ci.user_id = $1
          ORDER BY p.id
            FOR UPDATE OF ci, p`,
        [userId],
      );

      if (lines.length === 0) {
        throw new ValidationError("El carrito está vacío");
      }

      const sinStock = lines.filter((l) => l.quantity > l.stock);
      if (sinStock.length > 0) {
        const detalle = sinStock
          .map((l) => `${l.brand} ${l.model} (pedido: ${l.quantity}, disponible: ${l.stock})`)
          .join(", ");
        throw new ConflictError(`Stock insuficiente: ${detalle}`);
      }

      const cartItemIds: number[] = lines.map((l) => l.cart_item_id);

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (user_id, total_amount, payment_method)
         SELECT $1, SUM(p.price * ci.quantity), $3
           FROM cart_items ci
           JOIN products p ON p.id = ci.product_id
          WHERE ci.id = ANY($2::int[])
         RETURNING *`,
        [userId, cartItemIds, paymentMethod],
      );
      const orderRow = orderRows[0];

      const { rows: itemRows } = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         SELECT $1, ci.product_id, ci.quantity, p.price
           FROM cart_items ci
           JOIN products p ON p.id = ci.product_id
          WHERE ci.id = ANY($2::int[])
         RETURNING *`,
        [orderRow.id, cartItemIds],
      );

      await client.query(
        `UPDATE products p
            SET stock = p.stock - ci.quantity,
                updated_at = NOW()
           FROM cart_items ci
          WHERE ci.product_id = p.id
            AND ci.id = ANY($1::int[])`,
        [cartItemIds],
      );

      await client.query(`DELETE FROM cart_items WHERE id = ANY($1::int[])`, [
        cartItemIds,
      ]);

      await client.query("COMMIT");

      return this.toOrder(
        orderRow,
        itemRows.map((r) => this.toItem(r)),
      );
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async findByUserId(userId: number): Promise<OrderWithProducts[]> {
    const { rows: orderRows } = await this.pool.query(
      `SELECT * FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC`,
      [userId],
    );
    if (orderRows.length === 0) return [];

    const orderIds: number[] = orderRows.map((o) => o.id);
    const { rows: itemRows } = await this.pool.query(
      `SELECT oi.*, p.brand, p.model
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ANY($1::int[])
        ORDER BY oi.id`,
      [orderIds],
    );

    const itemsByOrder = new Map<number, OrderItemDetail[]>();
    for (const r of itemRows) {
      const item: OrderItemDetail = { ...this.toItem(r), brand: r.brand, model: r.model };
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return orderRows.map((o) => this.toOrder(o, itemsByOrder.get(o.id) ?? []));
  }
}