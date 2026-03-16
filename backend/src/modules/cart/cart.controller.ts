import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import pool from "../../config/db";

// Get cart items with full product details
export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      `SELECT ci.id as cart_item_id, ci.quantity, ci.product_id,
              p.name, p.slug, p.price, p.mrp, p.unit, p.sku, p.image_url,
              p.stock_qty, p.min_order_qty,
              b.name as brand_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Add item to cart (or increment qty if exists)
export const addItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) return res.status(400).json({ message: "product_id is required" });

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
       RETURNING *`,
      [userId, product_id, quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update item quantity
export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "quantity must be at least 1" });
    }

    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1, updated_at = NOW()
       WHERE user_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, userId, productId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Item not in cart" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Remove item from cart
export const removeItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const productId = req.params.productId;

    const result = await pool.query(
      `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING id`,
      [userId, productId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Item not in cart" });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
};

// Clear entire cart
export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await pool.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};

// Sync cart (merge localStorage items into DB on login)
export const syncCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { items } = req.body; // Array of { product_id, quantity }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const item of items) {
        await client.query(
          `INSERT INTO cart_items (user_id, product_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, product_id)
           DO UPDATE SET quantity = GREATEST(cart_items.quantity, $3), updated_at = NOW()`,
          [userId, item.product_id, item.quantity]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    // Return updated cart
    const result = await pool.query(
      `SELECT ci.id as cart_item_id, ci.quantity, ci.product_id,
              p.name, p.slug, p.price, p.mrp, p.unit, p.sku, p.image_url,
              p.stock_qty, p.min_order_qty,
              b.name as brand_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
