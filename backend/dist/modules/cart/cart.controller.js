"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCart = exports.clearCart = exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// Get cart items with full product details (paginated)
const getCart = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const pag = (0, pagination_1.parsePagination)(req);
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM cart_items WHERE user_id = $1`, [userId]);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT ci.id as cart_item_id, ci.quantity, ci.product_id,
              p.name, p.slug, p.price, p.mrp, p.unit, p.sku, p.image_url,
              p.stock_qty, p.min_order_qty,
              b.name as brand_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC
       LIMIT $2 OFFSET $3`, [userId, pag.pageSize, pag.offset]);
        res.json((0, pagination_1.buildPaginatedResponse)(result.rows, total, pag));
    }
    catch (err) {
        next(err);
    }
};
exports.getCart = getCart;
// Add item to cart (or increment qty if exists)
const addItem = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { product_id, quantity = 1 } = req.body;
        if (!product_id)
            return res.status(400).json({ message: "product_id is required" });
        // Look up product MOQ
        const productResult = await db_1.default.query(`SELECT min_order_qty FROM products WHERE id = $1`, [product_id]);
        if (productResult.rows.length === 0)
            return res.status(404).json({ message: "Product not found" });
        const moq = productResult.rows[0].min_order_qty || 1;
        if (quantity < moq) {
            return res.status(400).json({ message: `Minimum order quantity is ${moq}` });
        }
        const result = await db_1.default.query(`INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
       RETURNING *`, [userId, product_id, quantity]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        next(err);
    }
};
exports.addItem = addItem;
// Update item quantity
const updateItem = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;
        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "quantity must be at least 1" });
        }
        // Validate against product MOQ
        const productResult = await db_1.default.query(`SELECT min_order_qty FROM products WHERE id = $1`, [productId]);
        if (productResult.rows.length > 0) {
            const moq = productResult.rows[0].min_order_qty || 1;
            if (quantity < moq) {
                return res.status(400).json({ message: `Minimum order quantity is ${moq}` });
            }
        }
        const result = await db_1.default.query(`UPDATE cart_items SET quantity = $1, updated_at = NOW()
       WHERE user_id = $2 AND product_id = $3
       RETURNING *`, [quantity, userId, productId]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: "Item not in cart" });
        res.json(result.rows[0]);
    }
    catch (err) {
        next(err);
    }
};
exports.updateItem = updateItem;
// Remove item from cart
const removeItem = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;
        const result = await db_1.default.query(`DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING id`, [userId, productId]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: "Item not in cart" });
        res.json({ message: "Item removed from cart" });
    }
    catch (err) {
        next(err);
    }
};
exports.removeItem = removeItem;
// Clear entire cart
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        await db_1.default.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
        res.json({ message: "Cart cleared" });
    }
    catch (err) {
        next(err);
    }
};
exports.clearCart = clearCart;
// Sync cart (merge localStorage items into DB on login)
const syncCart = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { items } = req.body; // Array of { product_id, quantity }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "items array is required" });
        }
        const client = await db_1.default.connect();
        try {
            await client.query("BEGIN");
            for (const item of items) {
                await client.query(`INSERT INTO cart_items (user_id, product_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, product_id)
           DO UPDATE SET quantity = GREATEST(cart_items.quantity, $3), updated_at = NOW()`, [userId, item.product_id, item.quantity]);
            }
            await client.query("COMMIT");
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
        // Return updated cart
        const result = await db_1.default.query(`SELECT ci.id as cart_item_id, ci.quantity, ci.product_id,
              p.name, p.slug, p.price, p.mrp, p.unit, p.sku, p.image_url,
              p.stock_qty, p.min_order_qty,
              b.name as brand_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`, [userId]);
        res.json(result.rows);
    }
    catch (err) {
        next(err);
    }
};
exports.syncCart = syncCart;
//# sourceMappingURL=cart.controller.js.map