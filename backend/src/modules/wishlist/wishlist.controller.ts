import { Response } from "express";
import pool from "../../config/db";
import { AuthRequest } from "../../middleware/auth.middleware";
import { parsePagination, buildPaginatedResponse } from "../../utils/pagination";

// GET /api/wishlist — list wishlist items with product details (paginated)
export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const pag = parsePagination(req);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM wishlists WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT w.id, w.product_id, w.created_at,
              p.name, p.slug, p.price, p.mrp, p.image_url, p.unit, p.stock_qty,
              b.name AS brand_name
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pag.pageSize, pag.offset]
    );
    res.json(buildPaginatedResponse(result.rows, total, pag));
  } catch (error: any) {
    console.error("Wishlist getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/wishlist — add product to wishlist
export const add = async (req: AuthRequest, res: Response) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ message: "product_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO wishlists (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [req.user!.userId, product_id]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "Already in wishlist" });
    }
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Wishlist add error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/wishlist/:productId — remove from wishlist by product ID
export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      "DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2 RETURNING id",
      [req.user!.userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not in wishlist" });
    }
    res.json({ message: "Removed from wishlist" });
  } catch (error: any) {
    console.error("Wishlist remove error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/wishlist/check/:productId — check if product is in wishlist
export const check = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      "SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2",
      [req.user!.userId, productId]
    );
    res.json({ inWishlist: result.rows.length > 0 });
  } catch (error: any) {
    console.error("Wishlist check error:", error);
    res.status(500).json({ message: error.message });
  }
};
