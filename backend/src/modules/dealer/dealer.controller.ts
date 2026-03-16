import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/dealers
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_active, created_at
       FROM dealers
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Dealer getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dealers/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_active, created_at
       FROM dealers WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Dealer not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Dealer getById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/dealers
export const create = async (req: Request, res: Response) => {
  try {
    const {
      company_name, contact_name, email, phone, gstin,
      address, city, state, pincode,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO dealers (company_name, contact_name, email, phone, gstin,
                            address, city, state, pincode, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING *`,
      [company_name, contact_name || null, email || null, phone || null, gstin || null,
       address || null, city || null, state || null, pincode || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Dealer create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Dealer already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/dealers/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      company_name, contact_name, email, phone, gstin,
      address, city, state, pincode, is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE dealers SET
        company_name = COALESCE($1, company_name),
        contact_name = COALESCE($2, contact_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        gstin = COALESCE($5, gstin),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        pincode = COALESCE($9, pincode),
        is_active = COALESCE($10, is_active),
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [company_name, contact_name, email, phone, gstin,
       address, city, state, pincode, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Dealer not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Dealer update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/dealers/:id (soft delete)
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE dealers SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Dealer not found" });
    }
    res.json({ message: "Dealer deactivated" });
  } catch (error: any) {
    console.error("Dealer delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
