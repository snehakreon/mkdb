import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/buyers — list all buyers
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_active, created_at
       FROM buyers
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Buyer getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/buyers/:id — get buyer by ID
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_active, created_at
       FROM buyers WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Buyer not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Buyer getById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/buyers — create a new buyer
export const create = async (req: Request, res: Response) => {
  try {
    const {
      company_name, contact_name, email, phone, gstin,
      address, city, state, pincode,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO buyers (company_name, contact_name, email, phone, gstin,
                           address, city, state, pincode, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING *`,
      [company_name, contact_name || null, email || null, phone || null, gstin || null,
       address || null, city || null, state || null, pincode || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Buyer create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Buyer already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/buyers/:id — update buyer
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      company_name, contact_name, email, phone, gstin,
      address, city, state, pincode, is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE buyers SET
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
      return res.status(404).json({ message: "Buyer not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Buyer update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/buyers/:id — soft-delete (deactivate) buyer
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE buyers SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [id]
    );
    res.json({ message: "Buyer deactivated successfully" });
  } catch (error: any) {
    console.error("Buyer delete error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/buyers/:id/projects — list projects for a buyer
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM projects WHERE buyer_id = $1 AND is_active = true ORDER BY created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Buyer getProjects error:", error);
    res.status(500).json({ message: error.message });
  }
};
