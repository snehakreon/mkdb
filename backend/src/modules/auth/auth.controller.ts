import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../../config/db";
import { generateTokens } from "../../utils/generateTokens";
import { v4 as uuidv4 } from "uuid";

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users 
        (id, email, phone, password_hash, first_name, last_name, user_type, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, 'admin', true)`,
      [userId, email, phone, hashedPassword, firstName, lastName]
    );

    await pool.query(
      `INSERT INTO user_roles (user_id, role, is_active)
       VALUES ($1, 'super_admin', true)`,
      [userId]
    );

    res.json({ message: "Admin created successfully" });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const tokens = generateTokens(user.id);

    await pool.query(
      `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, tokens.refreshToken]
    );

    res.json(tokens);

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
