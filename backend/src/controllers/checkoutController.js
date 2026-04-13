import pool from '../config/db.js';
import { transaction } from '../config/db.js';
import { placeOrder } from '../services/checkoutService.js';
import { randomUUID } from 'crypto';

function makeId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

export async function getCustomers(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, unique_id, name, email, zip_code, city, state FROM Customers ORDER BY name LIMIT 25'
    );
    res.json({ success: true, data: rows || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function searchCustomers(req, res) {
  try {
    const q = `%${req.query.q || ''}%`;
    const [rows] = await pool.execute(
      'SELECT id, unique_id, name, email FROM Customers WHERE name LIKE ? OR email LIKE ? ORDER BY name LIMIT 50',
      [q, q]
    );
    res.json({ success: true, data: rows || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCustomer(req, res) {
  try {
    const { name, email, zip_code, city, state, unique_id } = req.body;
    const id = makeId('cus');
    await pool.execute(
      'INSERT INTO customers (id, unique_id, name, email, zip_code, city, state)VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, unique_id || null, name || null, email || null, zip_code || null, city || null, state || null]
    );
    const [rows] = await pool.execute(
      'SELECT id, unique_id, name, email, zip_code, city, state FROM Customers WHERE id = ?',
      [id]
    );
    res.status(201).json({ success: true, data: rows?.[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProducts(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const sellerId = req.user.id;
    const isAdmin = req.user.role === "admin";
    const q = `%${req.query.q || ""}%`;

    let rows;

    if (isAdmin) {
      [rows] = await pool.execute(
        `
        SELECT
  p.id,
  p.name,
  COALESCE(SUM(i.stock), 0) AS stock,
  COALESCE(MAX(lp.price), 0) AS price
FROM Products p
LEFT JOIN Inventory i 
  ON i.product_id = p.id
LEFT JOIN (
  SELECT product_id, price
  FROM Order_Items oi
  WHERE id IN (
    SELECT MAX(id)
    FROM Order_Items
    GROUP BY product_id
  )
) lp ON lp.product_id = p.id
WHERE p.name LIKE ?
GROUP BY p.id, p.name
ORDER BY p.name
LIMIT 100
        `,
        [q]
      );
    } else {
      [rows] = await pool.execute(
        `
        SELECT 
          p.id,
          p.name,
          COALESCE(i.stock, 0) AS stock,
          COALESCE(lp.price, 0) AS price
        FROM Products p
        LEFT JOIN Inventory i 
          ON i.product_id = p.id AND i.seller_id = ?
        LEFT JOIN (
          SELECT product_id, seller_id, price
          FROM Order_Items oi
          WHERE id IN (
            SELECT MAX(id)
            FROM Order_Items
            GROUP BY product_id, seller_id
          )
        ) lp 
          ON lp.product_id = p.id AND lp.seller_id = ?
        WHERE p.name LIKE ?
        ORDER BY p.name
        LIMIT 100
        `,
        [sellerId, sellerId, q]
      );
    }

    res.json({
      success: true,
      data: rows || [],
    });

  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
export async function createOrder(req, res) {
  try {
    const { customerId, items } = req.body;
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'customerId and non-empty items required' });
    }
    const sellerId = req.user.id;
    const normalized = items.map((i) => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity) || 1,
    unitPrice: Number(i.price),
    })).filter((i) => i.productId.length > 0 && i.quantity > 0);

    const result = await transaction(async (conn) => {
      return await placeOrder(conn, { customerId, items: normalized, sellerId });
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    const status = err.message?.includes('Insufficient stock') ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
}
