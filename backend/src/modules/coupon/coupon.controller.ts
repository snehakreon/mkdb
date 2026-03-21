import { Request, Response, NextFunction } from "express";
import pool from "../../config/db";
import { getPaginationParams, paginatedResponse } from "../../utils/pagination";

// Validate a coupon code
export const validate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const result = await pool.query(
      `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = true`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    const coupon = result.rows[0];
    const now = new Date();

    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return res.status(400).json({ message: "Coupon is not yet active" });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    const orderAmount = Number(subtotal) || 0;
    if (orderAmount < Number(coupon.min_order_amount)) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${Number(coupon.min_order_amount).toLocaleString("en-IN")}`,
      });
    }

    // Calculate discount
    let discount_amount = 0;
    if (coupon.discount_type === "percentage") {
      discount_amount = (orderAmount * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount) {
        discount_amount = Math.min(discount_amount, Number(coupon.max_discount));
      }
    } else {
      discount_amount = Number(coupon.discount_value);
    }

    discount_amount = Math.min(discount_amount, orderAmount);

    res.json({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      discount_amount: Math.round(discount_amount * 100) / 100,
      description: coupon.description,
    });
  } catch (err) {
    next(err);
  }
};

// Get all coupons (admin)
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset, search } = getPaginationParams(req);

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      conditions.push(`(code ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM coupons ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM coupons ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    res.json(paginatedResponse(result.rows, total, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
};

// Create coupon (admin)
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until } = req.body;
    const result = await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until)
       VALUES (UPPER($1), $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [code, description, discount_type || "percentage", discount_value, min_order_amount || 0, max_discount, usage_limit, valid_from || new Date(), valid_until]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ message: "Coupon code already exists" });
    next(err);
  }
};

// Update coupon (admin)
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, is_active, valid_from, valid_until } = req.body;
    const result = await pool.query(
      `UPDATE coupons SET code=UPPER($1), description=$2, discount_type=$3, discount_value=$4,
       min_order_amount=$5, max_discount=$6, usage_limit=$7, is_active=$8, valid_from=$9, valid_until=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, is_active, valid_from, valid_until, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Coupon not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete coupon (admin)
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query("DELETE FROM coupons WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
};
