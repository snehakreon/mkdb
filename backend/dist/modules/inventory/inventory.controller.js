"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStock = exports.getTransactions = exports.getSummary = exports.getStockLevels = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// GET /api/inventory — stock levels for all products
const getStockLevels = async (req, res) => {
    try {
        const { page, limit, offset, search } = (0, pagination_1.getPaginationParams)(req);
        const { alert } = req.query; // ?alert=low to filter low-stock items
        const params = [];
        let paramIdx = 1;
        const conditions = [];
        if (search) {
            conditions.push(`(p.name ILIKE $${paramIdx} OR p.sku ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }
        if (alert === "low") {
            conditions.push(`p.stock_qty <= 10`);
        }
        const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM products p${where}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT p.id, p.name, p.sku, p.stock_qty, p.min_order_qty, p.price, p.mrp,
              p.is_active, p.lead_time_days,
              c.name AS category_name, b.name AS brand_name,
              CASE WHEN p.stock_qty <= 0 THEN 'out_of_stock'
                   WHEN p.stock_qty <= 10 THEN 'low_stock'
                   ELSE 'in_stock' END AS stock_status
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id${where}
       ORDER BY p.stock_qty ASC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [...params, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (error) {
        console.error("Inventory getStockLevels error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getStockLevels = getStockLevels;
// GET /api/inventory/summary — stock overview stats
const getSummary = async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT
        COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE stock_qty <= 0) AS out_of_stock,
        COUNT(*) FILTER (WHERE stock_qty > 0 AND stock_qty <= 10) AS low_stock,
        COUNT(*) FILTER (WHERE stock_qty > 10) AS in_stock,
        SUM(stock_qty) AS total_units,
        SUM(stock_qty * price) AS total_stock_value
      FROM products WHERE is_active = true
    `);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Inventory summary error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getSummary = getSummary;
// GET /api/inventory/transactions — stock movement history
const getTransactions = async (req, res) => {
    try {
        const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
        const { product_id } = req.query;
        const params = [];
        let paramIdx = 1;
        const conditions = [];
        if (product_id) {
            conditions.push(`it.product_id = $${paramIdx++}`);
            params.push(product_id);
        }
        const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM inventory_transactions it${where}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT it.id, it.product_id, it.transaction_type, it.quantity_change,
              it.quantity_before, it.quantity_after, it.reason,
              it.reference_type, it.reference_id, it.created_at,
              p.name AS product_name, p.sku
       FROM inventory_transactions it
       LEFT JOIN products p ON it.product_id = p.id${where}
       ORDER BY it.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [...params, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (error) {
        console.error("Inventory transactions error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getTransactions = getTransactions;
// PUT /api/inventory/:productId — update stock quantity manually
const updateStock = async (req, res) => {
    const client = await db_1.default.connect();
    try {
        const { productId } = req.params;
        const { quantity, reason } = req.body;
        if (quantity == null) {
            return res.status(400).json({ message: "quantity is required" });
        }
        await client.query("BEGIN");
        const current = await client.query(`SELECT id, name, stock_qty FROM products WHERE id = $1`, [productId]);
        if (current.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Product not found" });
        }
        const oldQty = current.rows[0].stock_qty;
        const newQty = Number(quantity);
        const change = newQty - oldQty;
        await client.query(`UPDATE products SET stock_qty = $1, updated_at = NOW() WHERE id = $2`, [newQty, productId]);
        await client.query(`INSERT INTO inventory_transactions (product_id, transaction_type, quantity_change, quantity_before, quantity_after, reason, reference_type)
       VALUES ($1, $2, $3, $4, $5, $6, 'manual_adjustment')`, [productId, change >= 0 ? "add" : "reduce", Math.abs(change), oldQty, newQty, reason || "Manual stock update"]);
        await client.query("COMMIT");
        res.json({ product_id: productId, old_qty: oldQty, new_qty: newQty, change });
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("Inventory updateStock error:", error);
        res.status(500).json({ message: error.message });
    }
    finally {
        client.release();
    }
};
exports.updateStock = updateStock;
//# sourceMappingURL=inventory.controller.js.map