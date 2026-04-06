"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentOrders = exports.getTopProducts = exports.getRevenueByMonth = exports.getOrdersByStatus = exports.getStats = void 0;
const db_1 = __importDefault(require("../../config/db"));
// GET /api/dashboard/stats — overall stats
const getStats = async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending' OR status = 'pending_dealer_approval') AS pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'delivered') AS delivered_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'cancelled') AS cancelled_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') AS total_revenue,
        (SELECT COUNT(*) FROM products WHERE is_active = true) AS total_products,
        (SELECT COUNT(*) FROM products WHERE stock_qty <= 0) AS out_of_stock_products,
        (SELECT COUNT(*) FROM buyers WHERE is_active = true) AS total_buyers,
        (SELECT COUNT(*) FROM dealers WHERE is_active = true) AS total_dealers,
        (SELECT COUNT(*) FROM vendors WHERE is_active = true) AS total_vendors
    `);
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getStats = getStats;
// GET /api/dashboard/orders-by-status — for pie chart
const getOrdersByStatus = async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT status AS name, COUNT(*)::int AS value
      FROM orders
      GROUP BY status
      ORDER BY value DESC
    `);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOrdersByStatus = getOrdersByStatus;
// GET /api/dashboard/revenue-by-month — for bar chart
const getRevenueByMonth = async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT TO_CHAR(created_at, 'Mon YYYY') AS month,
             EXTRACT(YEAR FROM created_at) AS year,
             EXTRACT(MONTH FROM created_at) AS month_num,
             COALESCE(SUM(total_amount), 0)::numeric AS revenue,
             COUNT(*)::int AS orders
      FROM orders
      WHERE status != 'cancelled'
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month, year, month_num
      ORDER BY year, month_num
    `);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRevenueByMonth = getRevenueByMonth;
// GET /api/dashboard/top-products — for bar chart
const getTopProducts = async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT p.name, p.sku, SUM(oi.quantity)::int AS units_sold,
             SUM(oi.total_price)::numeric AS revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name, p.sku
      ORDER BY revenue DESC
      LIMIT 10
    `);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTopProducts = getTopProducts;
// GET /api/dashboard/recent-orders — latest 10
const getRecentOrders = async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT o.id, o.order_number, o.status, o.payment_status, o.total_amount, o.created_at,
             b.company_name AS buyer_company
      FROM orders o
      LEFT JOIN buyers b ON o.buyer_id = b.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRecentOrders = getRecentOrders;
//# sourceMappingURL=dashboard.controller.js.map