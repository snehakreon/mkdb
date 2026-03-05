import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../../config/db";

// GET /api/dealers
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, dealer_code, company_name, gstin, pan,
              bank_account_number, bank_ifsc, bank_name, bank_branch,
              credit_limit, available_credit, credit_payment_terms_days,
              approval_status, business_address, contact_phone, contact_email,
              created_at
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
      `SELECT id, dealer_code, company_name, gstin, pan,
              bank_account_number, bank_ifsc, bank_name, bank_branch,
              credit_limit, available_credit, credit_payment_terms_days,
              approval_status, business_address, contact_phone, contact_email,
              created_at
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
  const client = await pool.connect();
  try {
    const {
      dealer_code, company_name, gstin, pan,
      bank_account_number, bank_ifsc, bank_name, bank_branch,
      credit_limit, credit_payment_terms_days,
      business_address, contact_phone, contact_email
    } = req.body;

    await client.query("BEGIN");

    // Create a user account for the dealer
    const hashedPassword = await bcrypt.hash("dealer123", 10);
    const userResult = await client.query(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
       VALUES ($1, $2, $3, $4, 'Dealer', 'dealer', false, true)
       RETURNING id`,
      [contact_email, contact_phone, hashedPassword, company_name]
    );
    const userId = userResult.rows[0].id;

    const result = await client.query(
      `INSERT INTO dealers (user_id, dealer_code, company_name, gstin, pan,
                            bank_account_number, bank_ifsc, bank_name, bank_branch,
                            credit_limit, available_credit, credit_payment_terms_days,
                            approval_status, business_address, contact_phone, contact_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, 'pending', $12, $13, $14)
       RETURNING id, dealer_code, company_name, gstin, pan,
                 bank_account_number, bank_ifsc, bank_name, bank_branch,
                 credit_limit, available_credit, credit_payment_terms_days,
                 approval_status, business_address, contact_phone, contact_email, created_at`,
      [userId, dealer_code, company_name, gstin, pan,
       bank_account_number || null, bank_ifsc || null, bank_name || null, bank_branch || null,
       credit_limit || 0, credit_payment_terms_days || 0,
       business_address || null, contact_phone, contact_email]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Dealer create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Dealer with this GSTIN or code already exists" });
    }
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// PUT /api/dealers/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      dealer_code, company_name, gstin, pan,
      bank_account_number, bank_ifsc, bank_name, bank_branch,
      credit_limit, available_credit, credit_payment_terms_days,
      approval_status, business_address, contact_phone, contact_email
    } = req.body;

    const result = await pool.query(
      `UPDATE dealers SET
        dealer_code = COALESCE($1, dealer_code),
        company_name = COALESCE($2, company_name),
        gstin = COALESCE($3, gstin),
        pan = COALESCE($4, pan),
        bank_account_number = COALESCE($5, bank_account_number),
        bank_ifsc = COALESCE($6, bank_ifsc),
        bank_name = COALESCE($7, bank_name),
        bank_branch = COALESCE($8, bank_branch),
        credit_limit = COALESCE($9, credit_limit),
        available_credit = COALESCE($10, available_credit),
        credit_payment_terms_days = COALESCE($11, credit_payment_terms_days),
        approval_status = COALESCE($12, approval_status),
        business_address = COALESCE($13, business_address),
        contact_phone = COALESCE($14, contact_phone),
        contact_email = COALESCE($15, contact_email)
       WHERE id = $16
       RETURNING id, dealer_code, company_name, gstin, pan,
                 bank_account_number, bank_ifsc, bank_name, bank_branch,
                 credit_limit, available_credit, credit_payment_terms_days,
                 approval_status, business_address, contact_phone, contact_email`,
      [dealer_code, company_name, gstin, pan,
       bank_account_number, bank_ifsc, bank_name, bank_branch,
       credit_limit, available_credit, credit_payment_terms_days,
       approval_status, business_address, contact_phone, contact_email, id]
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

// DELETE /api/dealers/:id (soft delete via approval_status)
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE dealers SET approval_status = 'suspended' WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Dealer not found" });
    }
    res.json({ message: "Dealer suspended" });
  } catch (error: any) {
    console.error("Dealer delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
