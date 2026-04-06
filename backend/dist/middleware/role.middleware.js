"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const db_1 = __importDefault(require("../config/db"));
/**
 * Middleware that checks if the authenticated user has one of the required roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: router.get("/admin-only", authenticate, requireRole("super_admin", "ops_admin"), handler)
 */
const requireRole = (...allowedRoles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        try {
            const result = await db_1.default.query(`SELECT role FROM user_roles
         WHERE user_id = $1 AND is_active = true`, [req.user.userId]);
            const userRoles = result.rows.map((r) => r.role);
            const hasRole = allowedRoles.some((role) => userRoles.includes(role));
            if (!hasRole) {
                return res.status(403).json({ message: "Forbidden — insufficient role" });
            }
            next();
        }
        catch (err) {
            console.error("Role check error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=role.middleware.js.map