import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/vendors
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, vendor_code, company_name, gstin,
              contact_person_name, contact_phone, contact_email,
              verification_status, is_active, created_at
       FROM vendors
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
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
      `SELECT id, vendor_code, company_name, gstin,
              contact_person_name, contact_phone, contact_email,
              verification_status, is_active, created_at
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
      vendor_code, company_name, gstin,
      contact_person_name, contact_phone, contact_email,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vendors (vendor_code, company_name, gstin,
                            contact_person_name, contact_phone, contact_email,
                            verification_status, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', true)
       RETURNING id, vendor_code, company_name, gstin,
                 contact_person_name, contact_phone, contact_email,
                 verification_status, is_active, created_at`,
      [vendor_code, company_name, gstin, contact_person_name, contact_phone, contact_email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Vendor create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Vendor code or GSTIN already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/vendors/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      vendor_code, company_name, gstin,
      contact_person_name, contact_phone, contact_email,
      verification_status, is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE vendors SET
        vendor_code = COALESCE($1, vendor_code),
        company_name = COALESCE($2, company_name),
        gstin = COALESCE($3, gstin),
        contact_person_name = COALESCE($4, contact_person_name),
        contact_phone = COALESCE($5, contact_phone),
        contact_email = COALESCE($6, contact_email),
        verification_status = COALESCE($7, verification_status),
        is_active = COALESCE($8, is_active)
       WHERE id = $9
       RETURNING id, vendor_code, company_name, gstin,
                 contact_person_name, contact_phone, contact_email,
                 verification_status, is_active`,
      [vendor_code, company_name, gstin, contact_person_name, contact_phone, contact_email, verification_status, is_active, id]
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
      "UPDATE vendors SET is_active = false WHERE id = $1 RETURNING id",
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
