import { transaction } from '../config/db.js';

export async function placeOrder(conn, { customerId, items, sellerId }) {
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const [inv] = await conn.execute(
      'SELECT stock FROM Inventory WHERE product_id = ? AND seller_id = ? FOR UPDATE',
      [item.productId, sellerId]
    );
    const row = inv?.[0];
    if (!row || row.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.productId}`);
    }
    let price = Number(item.unitPrice);
    if (!Number.isFinite(price) || price < 0) {
      const [lastPriceRows] = await conn.execute(
        `SELECT price
         FROM Order_Items
         WHERE product_id = ? AND seller_id = ?
         ORDER BY id DESC
         LIMIT 1`,
        [item.productId, sellerId]
      );
      price = Number(lastPriceRows?.[0]?.price ?? 0);
    }
    const lineTotal = price * item.quantity;
    totalAmount += lineTotal;
    orderItems.push({ productId: item.productId, quantity: item.quantity, price });
  }

  const [orderResult] = await conn.execute(
    'INSERT INTO Orders (customer_id, total_amount) VALUES (?, ?)',
    [customerId, totalAmount]
  );
  const orderId = orderResult.insertId;

  for (const oi of orderItems) {
    await conn.execute(
      'INSERT INTO Order_Items (order_id, product_id, seller_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
      [orderId, oi.productId, sellerId, oi.quantity, oi.price]
    );
    await conn.execute(
      'UPDATE Inventory SET stock = stock - ? WHERE product_id = ? AND seller_id = ?',
      [oi.quantity, oi.productId, sellerId]
    );
  }

  return { orderId, totalAmount };
}
