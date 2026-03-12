import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/orders
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.total_amount,
              o.shipping_address, o.notes, o.created_at, o.updated_at,
              o.buyer_id, o.dealer_id, o.vendor_id,
              b.company_name AS buyer_company, b.contact_name AS buyer_contact,
              d.company_name AS dealer_company,
              v.company_name AS vendor_company
       FROM orders o
       LEFT JOIN buyers b ON o.buyer_id = b.id
       LEFT JOIN dealers d ON o.dealer_id = d.id
       LEFT JOIN vendors v ON o.vendor_id = v.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Order getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.total_amount,
              o.shipping_address, o.notes, o.created_at, o.updated_at,
              o.buyer_id, o.dealer_id, o.vendor_id,
              b.company_name AS buyer_company, b.contact_name AS buyer_contact,
              d.company_name AS dealer_company,
              v.company_name AS vendor_company
       FROM orders o
       LEFT JOIN buyers b ON o.buyer_id = b.id
       LEFT JOIN dealers d ON o.dealer_id = d.id
       LEFT JOIN vendors v ON o.vendor_id = v.id
       WHERE o.id = $1`,
      [id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.total_price,
              p.name AS product_name, p.sku
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (error: any) {
    console.error("Order getById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/orders
export const create = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { buyer_id, dealer_id, vendor_id, shipping_address, notes, items } = req.body;

    await client.query("BEGIN");

    // Generate order number
    const countResult = await client.query("SELECT COUNT(*) FROM orders");
    const orderNum = String(Number(countResult.rows[0].count) + 1).padStart(7, "0");
    const order_number = `ORD-${orderNum}`;

    // Calculate total from items
    let total_amount = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        total_amount += item.quantity * item.unit_price;
      }
    }

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, buyer_id, dealer_id, vendor_id, status,
                           total_amount, shipping_address, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7)
       RETURNING *`,
      [order_number, buyer_id || null, dealer_id || null, vendor_id || null,
       total_amount, shipping_address || null, notes || null]
    );

    const order_id = orderResult.rows[0].id;

    // Insert order items
    if (items && items.length > 0) {
      for (const item of items) {
        const total_price = item.quantity * item.unit_price;
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [order_id, item.product_id, item.quantity, item.unit_price, total_price]
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json(orderResult.rows[0]);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Order create error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// PUT /api/orders/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, total_amount, shipping_address, notes, vendor_id } = req.body;

    const result = await pool.query(
      `UPDATE orders SET
        status = COALESCE($1, status),
        total_amount = COALESCE($2, total_amount),
        shipping_address = COALESCE($3, shipping_address),
        notes = COALESCE($4, notes),
        vendor_id = COALESCE($5, vendor_id),
        updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [status, total_amount, shipping_address, notes, vendor_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Order update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/orders/:id (cancel order)
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND status NOT IN ('delivered', 'cancelled')
       RETURNING id, order_number`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found or cannot be cancelled" });
    }
    res.json({ message: "Order cancelled", order: result.rows[0] });
  } catch (error: any) {
    console.error("Order cancel error:", error);
    res.status(500).json({ message: error.message });
  }
};
