import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import pool from "../../config/db";
import { parsePagination, buildPaginatedResponse } from "../../utils/pagination";

// GET /api/orders (admin: all, buyer: own)
export const getAll = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const pag = parsePagination(req);
    let where = "";
    const params: any[] = [];
    let paramIdx = 1;

    const conditions: string[] = [];
    if (search) {
      conditions.push(`(o.order_number ILIKE $${paramIdx} OR b.company_name ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (status) {
      conditions.push(`o.status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }
    if (conditions.length > 0) {
      where = ` WHERE ${conditions.join(" AND ")}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM orders o LEFT JOIN buyers b ON o.buyer_id = b.id${where}`, params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.payment_method, o.payment_status,
              o.total_amount, o.shipping_address, o.notes, o.created_at, o.updated_at,
              o.buyer_id, o.dealer_id, o.vendor_id,
              b.company_name AS buyer_company, b.contact_name AS buyer_contact,
              d.company_name AS dealer_company,
              v.company_name AS vendor_company
       FROM orders o
       LEFT JOIN buyers b ON o.buyer_id = b.id
       LEFT JOIN dealers d ON o.dealer_id = d.id
       LEFT JOIN vendors v ON o.vendor_id = v.id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, pag.pageSize, pag.offset]
    );
    res.json(buildPaginatedResponse(result.rows, total, pag));
  } catch (error: any) {
    console.error("Order getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/my — buyer's own orders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const pag = parsePagination(req);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM orders o JOIN buyers b ON o.buyer_id = b.id WHERE b.user_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.payment_method, o.payment_status,
              o.total_amount, o.shipping_address, o.notes, o.created_at, o.updated_at,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       JOIN buyers b ON o.buyer_id = b.id
       WHERE b.user_id = $1
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pag.pageSize, pag.offset]
    );
    res.json(buildPaginatedResponse(result.rows, total, pag));
  } catch (error: any) {
    console.error("Order getMyOrders error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/my/:id — buyer's own order detail
export const getMyOrderDetail = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const orderResult = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.payment_method, o.payment_status,
              o.total_amount, o.shipping_address, o.notes, o.created_at, o.updated_at
       FROM orders o
       JOIN buyers b ON o.buyer_id = b.id
       WHERE o.id = $1 AND b.user_id = $2`,
      [id, userId]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemsResult = await pool.query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, oi.total_price,
              p.name AS product_name, p.sku, p.image_url, p.unit
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (error: any) {
    console.error("Order getMyOrderDetail error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.payment_method, o.payment_status,
              o.total_amount, o.shipping_address, o.notes, o.created_at, o.updated_at,
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
export const create = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const userId = req.user?.userId;
    const { buyer_id, dealer_id, vendor_id, shipping_address, notes, items, payment_method } = req.body;

    await client.query("BEGIN");

    // Auto-resolve buyer_id from logged-in user if not provided
    let resolvedBuyerId = buyer_id || null;
    if (!resolvedBuyerId && userId) {
      const buyerResult = await client.query(
        `SELECT id FROM buyers WHERE user_id = $1 AND is_active = true LIMIT 1`,
        [userId]
      );
      if (buyerResult.rows.length > 0) {
        resolvedBuyerId = buyerResult.rows[0].id;
      }
    }

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
                           payment_method, payment_status, total_amount, shipping_address, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9)
       RETURNING *`,
      [order_number, resolvedBuyerId, dealer_id || null, vendor_id || null,
       payment_method || "cod",
       payment_method === "cod" ? "unpaid" : "unpaid",
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

    // Clear the user's cart after successful order
    if (userId) {
      await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
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

// Valid state transitions for the order workflow
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
};

// PUT /api/orders/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, total_amount, shipping_address, notes, vendor_id, payment_status } = req.body;

    // If status is being changed, validate transition
    if (status) {
      const current = await pool.query(`SELECT status FROM orders WHERE id = $1`, [id]);
      if (current.rows.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      const currentStatus = current.rows[0].status;
      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          message: `Cannot transition from '${currentStatus}' to '${status}'. Allowed: ${allowed.join(", ") || "none (terminal state)"}`,
        });
      }
    }

    const result = await pool.query(
      `UPDATE orders SET
        status = COALESCE($1, status),
        total_amount = COALESCE($2, total_amount),
        shipping_address = COALESCE($3, shipping_address),
        notes = COALESCE($4, notes),
        vendor_id = COALESCE($5, vendor_id),
        payment_status = COALESCE($6, payment_status),
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [status, total_amount, shipping_address, notes, vendor_id, payment_status, id]
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

// PUT /api/orders/:id/status — dedicated status transition endpoint
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const current = await pool.query(`SELECT id, status, order_number FROM orders WHERE id = $1`, [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = current.rows[0].status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from '${currentStatus}' to '${status}'. Allowed: ${allowed.join(", ") || "none (terminal state)"}`,
        current_status: currentStatus,
        allowed_transitions: allowed,
      });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Order updateStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/orders/:id (cancel order)
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const current = await pool.query(`SELECT status FROM orders WHERE id = $1`, [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    const allowed = VALID_TRANSITIONS[current.rows[0].status] || [];
    if (!allowed.includes("cancelled")) {
      return res.status(400).json({
        message: `Cannot cancel order in '${current.rows[0].status}' state`,
      });
    }

    const result = await pool.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING id, order_number`,
      [id]
    );
    res.json({ message: "Order cancelled", order: result.rows[0] });
  } catch (error: any) {
    console.error("Order cancel error:", error);
    res.status(500).json({ message: error.message });
  }
};
