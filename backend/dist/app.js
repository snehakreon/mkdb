"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const zone_routes_1 = __importDefault(require("./modules/zone/zone.routes"));
const category_routes_1 = __importDefault(require("./modules/category/category.routes"));
const brand_routes_1 = __importDefault(require("./modules/brand/brand.routes"));
const vendor_routes_1 = __importDefault(require("./modules/vendor/vendor.routes"));
const product_routes_1 = __importDefault(require("./modules/product/product.routes"));
const dealer_routes_1 = __importDefault(require("./modules/dealer/dealer.routes"));
const order_routes_1 = __importDefault(require("./modules/order/order.routes"));
const buyer_routes_1 = __importDefault(require("./modules/buyer/buyer.routes"));
const address_routes_1 = __importDefault(require("./modules/address/address.routes"));
const wishlist_routes_1 = __importDefault(require("./modules/wishlist/wishlist.routes"));
const coupon_routes_1 = __importDefault(require("./modules/coupon/coupon.routes"));
const cart_routes_1 = __importDefault(require("./modules/cart/cart.routes"));
const upload_routes_1 = __importDefault(require("./modules/upload/upload.routes"));
const adminUser_routes_1 = __importDefault(require("./modules/admin-user/adminUser.routes"));
const inventory_routes_1 = __importDefault(require("./modules/inventory/inventory.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS — allow admin and buyer frontends (local + Render)
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Serve uploaded files
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/zones", zone_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/brands", brand_routes_1.default);
app.use("/api/vendors", vendor_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/dealers", dealer_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/buyers", buyer_routes_1.default);
app.use("/api/addresses", address_routes_1.default);
app.use("/api/wishlist", wishlist_routes_1.default);
app.use("/api/coupons", coupon_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/admin-users", adminUser_routes_1.default);
app.use("/api/inventory", inventory_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
// Health check
app.get("/", (_req, res) => {
    res.json({ status: "Material King API running" });
});
// DB diagnostic endpoint (remove in production)
app.get("/api/health", async (_req, res) => {
    try {
        const pool = (await Promise.resolve().then(() => __importStar(require("./config/db")))).default;
        const dbTime = await pool.query("SELECT NOW()");
        const adminCheck = await pool.query("SELECT u.id, u.email, u.is_active, u.is_verified, ur.role FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id WHERE u.email = 'admin@platform.com'");
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
        res.json({
            db: "connected",
            time: dbTime.rows[0].now,
            admin: adminCheck.rows.length > 0 ? { exists: true, is_active: adminCheck.rows[0].is_active, is_verified: adminCheck.rows[0].is_verified, role: adminCheck.rows[0].role } : { exists: false },
            tables: tables.rows.map((r) => r.table_name),
        });
    }
    catch (err) {
        res.status(500).json({ db: "error", message: err.message });
    }
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Centralized error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map