import { Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "./auth.middleware";

/**
 * Middleware that checks if the authenticated user has one of the required roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: router.get("/admin-only", authenticate, requireRole("super_admin", "ops_admin"), handler)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const result = await pool.query(
        `SELECT role FROM user_roles
         WHERE user_id = $1 AND is_active = true`,
        [req.user.userId]
      );

      const userRoles = result.rows.map((r) => r.role);
      const hasRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden — insufficient role" });
      }

      next();
    } catch (err) {
      console.error("Role check error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
