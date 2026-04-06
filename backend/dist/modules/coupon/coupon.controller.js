"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getAll = exports.validate = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// Validate a coupon code
const validate = async (req, res, next) => {
    try {
        const { code, subtotal } = req.body;
        if (!code)
            return res.status(400).json({ message: "Coupon code is required" });
        const result = await db_1.default.query(`SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = true`, [code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }
        const coupon = result.rows[0];
        const now = new Date();
        if (coupon.valid_from && new Date(coupon.valid_from) > now) {
            return res.status(400).json({ message: "Coupon is not yet active" });
        }
        if (coupon.valid_until && new Date(coupon.valid_until) < now) {
            return res.status(400).json({ message: "Coupon has expired" });
        }
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ message: "Coupon usage limit reached" });
        }
        const orderAmount = Number(subtotal) || 0;
        if (orderAmount < Number(coupon.min_order_amount)) {
            return res.status(400).json({
                message: `Minimum order amount is ₹${Number(coupon.min_order_amount).toLocaleString("en-IN")}`,
            });
        }
        // Calculate discount
        let discount_amount = 0;
        if (coupon.discount_type === "percentage") {
            discount_amount = (orderAmount * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount) {
                discount_amount = Math.min(discount_amount, Number(coupon.max_discount));
            }
        }
        else {
            discount_amount = Number(coupon.discount_value);
        }
        discount_amount = Math.min(discount_amount, orderAmount);
        res.json({
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: Number(coupon.discount_value),
            discount_amount: Math.round(discount_amount * 100) / 100,
            description: coupon.description,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.validate = validate;
// Get all coupons (admin)
const getAll = async (req, res, next) => {
    try {
        const { page, limit, offset, search } = (0, pagination_1.getPaginationParams)(req);
        const conditions = [];
        const params = [];
        let paramIdx = 1;
        if (search) {
            conditions.push(`(code ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM coupons ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT * FROM coupons ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, [...params, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (err) {
        next(err);
    }
};
exports.getAll = getAll;
// Create coupon (admin)
const create = async (req, res, next) => {
    try {
        const { code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until } = req.body;
        const toNum = (v) => (v === "" || v === null || v === undefined) ? null : Number(v);
        const toDate = (v) => (v === "" || v === null || v === undefined) ? null : v;
        const result = await db_1.default.query(`INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until)
       VALUES (UPPER($1), $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [code, description || null, discount_type || "percentage", toNum(discount_value), toNum(min_order_amount) ?? 0, toNum(max_discount), toNum(usage_limit), toDate(valid_from) || new Date(), toDate(valid_until)]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        if (err.code === "23505")
            return res.status(409).json({ message: "Coupon code already exists" });
        next(err);
    }
};
exports.create = create;
// Update coupon (admin)
const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, is_active, valid_from, valid_until } = req.body;
        const toNum = (v) => (v === "" || v === null || v === undefined) ? null : Number(v);
        const toDate = (v) => (v === "" || v === null || v === undefined) ? null : v;
        const result = await db_1.default.query(`UPDATE coupons SET code=UPPER($1), description=$2, discount_type=$3, discount_value=$4,
       min_order_amount=$5, max_discount=$6, usage_limit=$7, is_active=$8, valid_from=$9, valid_until=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`, [code, description || null, discount_type, toNum(discount_value), toNum(min_order_amount) ?? 0, toNum(max_discount), toNum(usage_limit), is_active ?? true, toDate(valid_from), toDate(valid_until), id]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: "Coupon not found" });
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === "23505")
            return res.status(409).json({ message: "Coupon code already exists" });
        next(err);
    }
};
exports.update = update;
// Delete coupon (admin)
const remove = async (req, res, next) => {
    try {
        const result = await db_1.default.query("DELETE FROM coupons WHERE id = $1 RETURNING id", [req.params.id]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: "Coupon not found" });
        res.json({ message: "Coupon deleted" });
    }
    catch (err) {
        next(err);
    }
};
exports.remove = remove;
//# sourceMappingURL=coupon.controller.js.map