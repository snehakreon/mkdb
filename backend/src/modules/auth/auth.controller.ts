import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import pool from "../../config/db";
import { generateTokens } from "../../utils/generateTokens";
import { AuthRequest } from "../../middleware/auth.middleware";

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, firstName, lastName, userType } = req.body;

    // Check if user already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR phone = $2",
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "User with this email or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const type = userType || "admin";

    // Determine role based on user type
    const roleMap: Record<string, string> = {
      admin: "super_admin",
      vendor: "vendor_admin",
      buyer: "buyer_admin",
      dealer: "dealer",
    };
    const role = roleMap[type] || "buyer_admin";

    // Insert user
    await pool.query(
      `INSERT INTO users (id, email, phone, password_hash, first_name, last_name, user_type, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
      [userId, email, phone, hashedPassword, firstName, lastName, type]
    );

    // Assign role
    await pool.query(
      `INSERT INTO user_roles (user_id, role, is_active)
       VALUES ($1, $2, true)`,
      [userId, role]
    );

    const tokens = generateTokens(userId);

    // Save session
    await pool.query(
      `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [userId, tokens.refreshToken]
    );

    res.status(201).json({
      message: "User registered successfully",
      ...tokens,
      user: { id: userId, email, firstName, lastName, userType: type, role },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT u.*, ur.role
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = true
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ message: "Account locked. Try again later." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      // Increment failed attempts
      await pool.query(
        `UPDATE users SET failed_login_attempts = failed_login_attempts + 1,
         locked_until = CASE WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes' ELSE locked_until END
         WHERE id = $1`,
        [user.id]
      );
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset failed attempts and update last login
    await pool.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    const tokens = generateTokens(user.id);

    // Save session
    await pool.query(
      `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, tokens.refreshToken]
    );

    // Collect all roles
    const roles = result.rows.map((r) => r.role).filter(Boolean);

    res.json({
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        roles,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/refresh
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Verify the refresh token
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as { userId: string };
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Check session exists
    const session = await pool.query(
      `SELECT id FROM user_sessions
       WHERE user_id = $1 AND refresh_token = $2 AND expires_at > NOW()`,
      [decoded.userId, refreshToken]
    );

    if (session.rows.length === 0) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.userId);

    // Update session with new refresh token
    await pool.query(
      `UPDATE user_sessions SET refresh_token = $1, expires_at = NOW() + INTERVAL '7 days'
       WHERE user_id = $2 AND refresh_token = $3`,
      [tokens.refreshToken, decoded.userId, refreshToken]
    );

    res.json(tokens);
  } catch (error: any) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/logout
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (req.user) {
      if (refreshToken) {
        await pool.query(
          "DELETE FROM user_sessions WHERE user_id = $1 AND refresh_token = $2",
          [req.user.userId, refreshToken]
        );
      } else {
        // If no specific token, clear all sessions for this user
        await pool.query("DELETE FROM user_sessions WHERE user_id = $1", [
          req.user.userId,
        ]);
      }
    }

    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/profile — update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { firstName, lastName, phone } = req.body;

    await pool.query(
      `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name),
       phone = COALESCE($3, phone), updated_at = NOW()
       WHERE id = $4`,
      [firstName, lastName, phone, req.user.userId]
    );

    // Return updated user
    const result = await pool.query(
      `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.user_type,
              COALESCE(json_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '[]') as roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = true
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.userId]
    );

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      roles: user.roles,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.user_type,
              u.is_active, u.is_verified, u.created_at,
              COALESCE(json_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '[]') as roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = true
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      isActive: user.is_active,
      isVerified: user.is_verified,
      roles: user.roles,
      createdAt: user.created_at,
    });
  } catch (error: any) {
    console.error("Me error:", error);
    res.status(500).json({ message: error.message });
  }
};
