import { Request, Response, NextFunction } from "express";
type FieldRule = {
    field: string;
    required?: boolean;
    type?: "string" | "number" | "boolean" | "array";
    minLength?: number;
    maxLength?: number;
};
/**
 * Simple request body validation middleware.
 *
 * Usage:
 *   router.post("/zones", validate([
 *     { field: "zone_name", required: true, type: "string", minLength: 2 },
 *     { field: "zone_code", required: true, type: "string" },
 *   ]), handler)
 */
export declare const validate: (rules: FieldRule[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map