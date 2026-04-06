"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
/**
 * Simple request body validation middleware.
 *
 * Usage:
 *   router.post("/zones", validate([
 *     { field: "zone_name", required: true, type: "string", minLength: 2 },
 *     { field: "zone_code", required: true, type: "string" },
 *   ]), handler)
 */
const validate = (rules) => {
    return (req, res, next) => {
        const errors = [];
        for (const rule of rules) {
            const value = req.body[rule.field];
            if (rule.required && (value === undefined || value === null || value === "")) {
                errors.push(`${rule.field} is required`);
                continue;
            }
            if (value === undefined || value === null)
                continue;
            if (rule.type === "string" && typeof value !== "string") {
                errors.push(`${rule.field} must be a string`);
            }
            if (rule.type === "number" && typeof value !== "number") {
                errors.push(`${rule.field} must be a number`);
            }
            if (rule.type === "boolean" && typeof value !== "boolean") {
                errors.push(`${rule.field} must be a boolean`);
            }
            if (rule.type === "array" && !Array.isArray(value)) {
                errors.push(`${rule.field} must be an array`);
            }
            if (rule.minLength &&
                typeof value === "string" &&
                value.length < rule.minLength) {
                errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
            }
            if (rule.maxLength &&
                typeof value === "string" &&
                value.length > rule.maxLength) {
                errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
            }
        }
        if (errors.length > 0) {
            return res.status(400).json({ message: "Validation failed", errors });
        }
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map