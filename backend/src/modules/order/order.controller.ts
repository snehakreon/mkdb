import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/orders
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.order_number, o.order_type, o.order_status, o.payment_status,
              o.subtotal, o.shipping_cost, o.tax_amount, o.discount_amount, o.total_amount,
              o.delivery_address, o.delivery_pincode, o.delivery_contact_name, o.delivery_contact_phone,
              o.expected_delivery_date, o.actual_delivery_date,
              o.buyer_notes, o.admin_notes, o.cancellation_reason,
              o.buyer_id, o.project_id, o.dealer_id, o.zone_id, o.assigned_vendor_id,
              o.created_at,
              b.company_name AS buyer_company,
              p.project_name,
              d.company_name AS dealer_company, d.dealer_code,
              v.company_name AS vendor_company, v.vendor_code,
              z.zone_name
       FROM orders o
       JOIN buyers b ON o.buyer_id = b.id
       JOIN projects p ON o.project_id = p.id
       LEFT JOIN dealers d ON o.dealer_id = d.id
       LEFT JOIN vendors v ON o.assigned_vendor_id = v.id
       JOIN zones z ON o.zone_id = z.id
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
      `SELECT o.*, b.company_name AS buyer_company,
              p.project_name, p.delivery_address AS project_delivery_address,
              d.company_name AS dealer_company, d.dealer_code,
              v.company_name AS vendor_company, v.vendor_code,
              z.zone_name
       FROM orders o
       JOIN buyers b ON o.buyer_id = b.id
       JOIN projects p ON o.project_id = p.id
       LEFT JOIN dealers d ON o.dealer_id = d.id
       LEFT JOIN vendors v ON o.assigned_vendor_id = v.id
       JOIN zones z ON o.zone_id = z.id
       WHERE o.id = $1`,
      [id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.*, pr.product_name, pr.sku_code
       FROM order_items oi
       JOIN products pr ON oi.product_id = pr.id
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
    const {
      buyer_id, project_id, dealer_id, order_type,
      delivery_address, delivery_pincode, delivery_contact_name, delivery_contact_phone,
      expected_delivery_date, buyer_notes, admin_notes, items
    } = req.body;

    await client.query("BEGIN");

    // Get zone from pincode
    const zoneResult = await client.query(
      "SELECT zone_id FROM zone_pincodes WHERE pincode = $1 LIMIT 1",
      [delivery_pincode]
    );
    const zone_id = zoneResult.rows.length > 0 ? zoneResult.rows[0].zone_id : null;

    // Get assigned vendor from zone
    let assigned_vendor_id = null;
    if (zone_id) {
      const vendorResult = await client.query(
        "SELECT vendor_id FROM zone_vendor_assignments WHERE zone_id = $1 AND is_active = true LIMIT 1",
        [zone_id]
      );
      if (vendorResult.rows.length > 0) {
        assigned_vendor_id = vendorResult.rows[0].vendor_id;
      }
    }

    // Generate order number
    const countResult = await client.query("SELECT COUNT(*) FROM orders");
    const orderNum = String(Number(countResult.rows[0].count) + 1).padStart(7, "0");
    const order_number = `ORD-${orderNum}`;

    // Calculate totals from items
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unit_price;
    }
    const tax_amount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const total_amount = subtotal + tax_amount;

    const initial_status = order_type === "dealer" ? "pending_dealer_approval" : "pending";

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, buyer_id, project_id, dealer_id, zone_id,
                           assigned_vendor_id, order_type, order_status,
                           subtotal, shipping_cost, tax_amount, discount_amount, total_amount,
                           payment_status, delivery_address, delivery_pincode,
                           delivery_contact_name, delivery_contact_phone,
                           expected_delivery_date, buyer_notes, admin_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, 0, $11, 'pending',
               $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [order_number, buyer_id, project_id, dealer_id || null, zone_id,
       assigned_vendor_id, order_type, initial_status,
       subtotal, tax_amount, total_amount,
       delivery_address, delivery_pincode, delivery_contact_name, delivery_contact_phone,
       expected_delivery_date || null, buyer_notes || null, admin_notes || null]
    );

    const order_id = orderResult.rows[0].id;

    // Insert order items
    for (const item of items) {
      const line_total = item.quantity * item.unit_price;
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total,
                                  product_name_snapshot, sku_code_snapshot)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order_id, item.product_id, item.quantity, item.unit_price, line_total,
         item.product_name || null, item.sku_code || null]
      );
    }

    await client.query("COMMIT");

    // Return full order
    const fullOrder = await pool.query(
      `SELECT o.*, b.company_name AS buyer_company, p.project_name, z.zone_name
       FROM orders o
       JOIN buyers b ON o.buyer_id = b.id
       JOIN projects p ON o.project_id = p.id
       JOIN zones z ON o.zone_id = z.id
       WHERE o.id = $1`,
      [order_id]
    );

    res.status(201).json(fullOrder.rows[0]);
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
    const {
      order_status, payment_status, admin_notes, cancellation_reason,
      expected_delivery_date, actual_delivery_date,
      assigned_vendor_id, delivery_contact_name, delivery_contact_phone
    } = req.body;

    const result = await pool.query(
      `UPDATE orders SET
        order_status = COALESCE($1, order_status),
        payment_status = COALESCE($2, payment_status),
        admin_notes = COALESCE($3, admin_notes),
        cancellation_reason = COALESCE($4, cancellation_reason),
        expected_delivery_date = COALESCE($5, expected_delivery_date),
        actual_delivery_date = COALESCE($6, actual_delivery_date),
        assigned_vendor_id = COALESCE($7, assigned_vendor_id),
        delivery_contact_name = COALESCE($8, delivery_contact_name),
        delivery_contact_phone = COALESCE($9, delivery_contact_phone)
       WHERE id = $10
       RETURNING *`,
      [order_status, payment_status, admin_notes, cancellation_reason,
       expected_delivery_date, actual_delivery_date, assigned_vendor_id,
       delivery_contact_name, delivery_contact_phone, id]
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
      `UPDATE orders SET order_status = 'cancelled', cancellation_reason = 'Cancelled by admin'
       WHERE id = $1 AND order_status NOT IN ('delivered', 'cancelled')
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
