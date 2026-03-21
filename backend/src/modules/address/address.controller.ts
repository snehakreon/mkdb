import { Response } from "express";
import pool from "../../config/db";
import { AuthRequest } from "../../middleware/auth.middleware";
import { parsePagination, buildPaginatedResponse } from "../../utils/pagination";

// GET /api/addresses — list addresses for logged-in user (paginated)
export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const pag = parsePagination(req);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM buyer_addresses WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, label, full_name, phone, address_line1, address_line2,
              city, state, pincode, is_default, created_at
       FROM buyer_addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pag.pageSize, pag.offset]
    );
    res.json(buildPaginatedResponse(result.rows, total, pag));
  } catch (error: any) {
    console.error("Address getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/addresses — create new address
export const create = async (req: AuthRequest, res: Response) => {
  try {
    const {
      label, full_name, phone, address_line1, address_line2,
      city, state, pincode, is_default,
    } = req.body;

    const userId = req.user!.userId;

    // If setting as default, unset all others first
    if (is_default) {
      await pool.query(
        "UPDATE buyer_addresses SET is_default = false WHERE user_id = $1",
        [userId]
      );
    }

    const result = await pool.query(
      `INSERT INTO buyer_addresses (user_id, label, full_name, phone, address_line1, address_line2,
                                     city, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, label || "Home", full_name, phone, address_line1, address_line2 || null,
       city, state, pincode, is_default || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Address create error:", error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/addresses/:id — update address
export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const {
      label, full_name, phone, address_line1, address_line2,
      city, state, pincode, is_default,
    } = req.body;

    // If setting as default, unset all others first
    if (is_default) {
      await pool.query(
        "UPDATE buyer_addresses SET is_default = false WHERE user_id = $1",
        [userId]
      );
    }

    const result = await pool.query(
      `UPDATE buyer_addresses SET
        label = COALESCE($1, label),
        full_name = COALESCE($2, full_name),
        phone = COALESCE($3, phone),
        address_line1 = COALESCE($4, address_line1),
        address_line2 = COALESCE($5, address_line2),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        pincode = COALESCE($8, pincode),
        is_default = COALESCE($9, is_default),
        updated_at = NOW()
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [label, full_name, phone, address_line1, address_line2,
       city, state, pincode, is_default, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Address update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/addresses/:id — delete address
export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await pool.query(
      "DELETE FROM buyer_addresses WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json({ message: "Address deleted" });
  } catch (error: any) {
    console.error("Address delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
