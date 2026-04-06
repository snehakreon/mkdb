import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
/**
 * Middleware that checks if the authenticated user has one of the required roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: router.get("/admin-only", authenticate, requireRole("super_admin", "ops_admin"), handler)
 */
export declare const requireRole: (...allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=role.middleware.d.ts.map