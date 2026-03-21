import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import pool from "../../config/db";
import { getPaginationParams, paginatedResponse } from "../../utils/pagination";

// GET /api/admin-users
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset, search } = getPaginationParams(req);

    const conditions: string[] = ["u.user_type = 'admin'"];
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      conditions.push(
        `(u.first_name ILIKE $${paramIdx} OR u.last_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx} OR u.phone ILIKE $${paramIdx})`
      );
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.user_type,
              u.is_active, u.is_verified, u.created_at, u.last_login_at,
              COALESCE(json_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '[]') as roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = true
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    res.json(paginatedResponse(result.rows, total, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
};

// POST /api/admin-users
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ message: "Email, password, and first name are required" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 'admin', true, true)`,
      [userId, email, phone || null, hashedPassword, firstName, lastName || null]
    );

    await pool.query(
      `INSERT INTO user_roles (user_id, role, is_active) VALUES ($1, 'super_admin', true)`,
      [userId]
    );

    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, user_type, is_active, is_verified, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin-users/:id
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { email, phone, password, firstName, lastName, is_active } = req.body;

    // Check user exists and is admin
    const existing = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND user_type = 'admin'",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Update basic info
    await pool.query(
      `UPDATE users SET email = COALESCE($1, email), phone = COALESCE($2, phone),
       first_name = COALESCE($3, first_name), last_name = COALESCE($4, last_name),
       is_active = COALESCE($5, is_active), updated_at = NOW()
       WHERE id = $6`,
      [email, phone, firstName, lastName, is_active, id]
    );

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [hashedPassword, id]
      );
    }

    const result = await pool.query(
      `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.user_type,
              u.is_active, u.is_verified, u.created_at, u.last_login_at
       FROM users u WHERE u.id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin-users/:id
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 AND user_type = 'admin' RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Clean up roles and sessions
    await pool.query("DELETE FROM user_roles WHERE user_id = $1", [id]);
    await pool.query("DELETE FROM user_sessions WHERE user_id = $1", [id]);

    res.json({ message: "Admin user deleted" });
  } catch (err) {
    next(err);
  }
};
