"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = exports.remove = exports.add = exports.getAll = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// GET /api/wishlist — list wishlist items with product details (paginated)
const getAll = async (req, res) => {
    try {
        const userId = req.user.userId;
        const pag = (0, pagination_1.parsePagination)(req);
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM wishlists WHERE user_id = $1`, [userId]);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT w.id, w.product_id, w.created_at,
              p.name, p.slug, p.price, p.mrp, p.image_url, p.unit, p.stock_qty,
              b.name AS brand_name
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC
       LIMIT $2 OFFSET $3`, [userId, pag.pageSize, pag.offset]);
        res.json((0, pagination_1.buildPaginatedResponse)(result.rows, total, pag));
    }
    catch (error) {
        console.error("Wishlist getAll error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAll = getAll;
// POST /api/wishlist — add product to wishlist
const add = async (req, res) => {
    try {
        const { product_id } = req.body;
        if (!product_id) {
            return res.status(400).json({ message: "product_id is required" });
        }
        const result = await db_1.default.query(`INSERT INTO wishlists (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`, [req.user.userId, product_id]);
        if (result.rows.length === 0) {
            return res.json({ message: "Already in wishlist" });
        }
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Wishlist add error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.add = add;
// DELETE /api/wishlist/:productId — remove from wishlist by product ID
const remove = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await db_1.default.query("DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2 RETURNING id", [req.user.userId, productId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item not in wishlist" });
        }
        res.json({ message: "Removed from wishlist" });
    }
    catch (error) {
        console.error("Wishlist remove error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.remove = remove;
// GET /api/wishlist/check/:productId — check if product is in wishlist
const check = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await db_1.default.query("SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2", [req.user.userId, productId]);
        res.json({ inWishlist: result.rows.length > 0 });
    }
    catch (error) {
        console.error("Wishlist check error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.check = check;
//# sourceMappingURL=wishlist.controller.js.map