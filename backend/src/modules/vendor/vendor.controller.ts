import { Request, Response } from "express";
import pool from "../../config/db";
import { getPaginationParams, paginatedResponse } from "../../utils/pagination";

// GET /api/vendors
export const getAll = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset, search } = getPaginationParams(req);
    const params: any[] = [];
    let paramIdx = 1;
    let where = "";

    if (search) {
      where = ` WHERE (company_name ILIKE $${paramIdx} OR contact_name ILIKE $${paramIdx} OR email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM vendors${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_verified, is_active, created_at
       FROM vendors${where}
       ORDER BY created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );
    res.json(paginatedResponse(result.rows, total, { page, limit, offset }));
  } catch (error: any) {
    console.error("Vendor getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vendors/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_verified, is_active, created_at
       FROM vendors WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Vendor getById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/vendors
export const create = async (req: Request, res: Response) => {
  try {
    const {
      company_name, contact_name, email, phone, gstin,
      address, city, state, pincode,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vendors (company_name, contact_name, email, phone, gstin,
                            address, city, state, pincode, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, true)
       RETURNING *`,
      [company_name, contact_name || null, email || null, phone || null, gstin || null,
       address || null, city || null, state || null, pincode || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Vendor create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Vendor already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/vendors/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      company_name, contact_name, email, phone, gstin,
      address, city, state, pincode, is_verified, is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE vendors SET
        company_name = COALESCE($1, company_name),
        contact_name = COALESCE($2, contact_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        gstin = COALESCE($5, gstin),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        pincode = COALESCE($9, pincode),
        is_verified = COALESCE($10, is_verified),
        is_active = COALESCE($11, is_active),
        updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [company_name, contact_name, email, phone, gstin,
       address, city, state, pincode, is_verified, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Vendor update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/vendors/:id
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE vendors SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ message: "Vendor deleted" });
  } catch (error: any) {
    console.error("Vendor delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
