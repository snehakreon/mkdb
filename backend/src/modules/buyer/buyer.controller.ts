import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import pool from "../../config/db";

// GET /api/buyers — list all buyers
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.company_name, b.gstin, b.company_type, b.is_active, b.created_at,
              b.pan, b.company_address, b.billing_address,
              u.first_name, u.last_name, u.email, u.phone
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.company_name`
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
      `SELECT b.*, u.first_name, u.last_name, u.email, u.phone
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
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

// POST /api/buyers — create a new buyer (also creates user account)
export const create = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      company_name, gstin, pan, company_type, company_address, billing_address,
      first_name, last_name, email, phone
    } = req.body;

    await client.query("BEGIN");

    // Create user account for buyer
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash("buyer123", 10);

    await client.query(
      `INSERT INTO users (id, email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 'buyer', true, true)`,
      [userId, email, phone, hashedPassword, first_name, last_name]
    );

    // Assign buyer role
    await client.query(
      `INSERT INTO user_roles (user_id, role, is_active) VALUES ($1, 'buyer_admin', true)`,
      [userId]
    );

    // Create buyer record
    const result = await client.query(
      `INSERT INTO buyers (user_id, company_name, gstin, pan, company_type, company_address, billing_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, company_name, gstin || null, pan || null, company_type || null, company_address || null, billing_address || null]
    );

    await client.query("COMMIT");

    res.status(201).json({ ...result.rows[0], first_name, last_name, email, phone });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Buyer create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Buyer with this email or phone already exists" });
    }
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// PUT /api/buyers/:id — update buyer
export const update = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      company_name, gstin, pan, company_type, company_address, billing_address,
      first_name, last_name, email, phone, is_active
    } = req.body;

    await client.query("BEGIN");

    // Update buyer record
    await client.query(
      `UPDATE buyers SET company_name = $1, gstin = $2, pan = $3, company_type = $4,
       company_address = $5, billing_address = $6, is_active = COALESCE($7, is_active),
       updated_at = NOW()
       WHERE id = $8`,
      [company_name, gstin || null, pan || null, company_type || null, company_address || null, billing_address || null, is_active, id]
    );

    // Update linked user record
    const buyer = await client.query("SELECT user_id FROM buyers WHERE id = $1", [id]);
    if (buyer.rows.length > 0) {
      await client.query(
        `UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4 WHERE id = $5`,
        [first_name, last_name, email, phone, buyer.rows[0].user_id]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Buyer updated successfully" });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Buyer update error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
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
      `SELECT id, project_name, project_code, delivery_address, delivery_pincode,
              delivery_city, delivery_state, site_manager_name, site_manager_phone,
              delivery_zone_id, is_active
       FROM projects
       WHERE buyer_id = $1 AND is_active = true
       ORDER BY project_name`,
      [id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Buyer getProjects error:", error);
    res.status(500).json({ message: error.message });
  }
};
