import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import zoneRoutes from "./modules/zone/zone.routes";
import categoryRoutes from "./modules/category/category.routes";
import brandRoutes from "./modules/brand/brand.routes";
import vendorRoutes from "./modules/vendor/vendor.routes";
import productRoutes from "./modules/product/product.routes";
import dealerRoutes from "./modules/dealer/dealer.routes";
import orderRoutes from "./modules/order/order.routes";
import buyerRoutes from "./modules/buyer/buyer.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// CORS — allow admin (3000) and buyer (5173) frontends
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dealers", dealerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/buyers", buyerRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "Material King API running" });
});

// DB diagnostic endpoint (remove in production)
app.get("/api/health", async (_req, res) => {
  try {
    const pool = (await import("./config/db")).default;
    const dbTime = await pool.query("SELECT NOW()");
    const adminCheck = await pool.query(
      "SELECT u.id, u.email, u.is_active, u.is_verified, ur.role FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id WHERE u.email = 'admin@platform.com'"
    );
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    res.json({
      db: "connected",
      time: dbTime.rows[0].now,
      admin: adminCheck.rows.length > 0 ? { exists: true, is_active: adminCheck.rows[0].is_active, is_verified: adminCheck.rows[0].is_verified, role: adminCheck.rows[0].role } : { exists: false },
      tables: tables.rows.map((r: any) => r.table_name),
    });
  } catch (err: any) {
    res.status(500).json({ db: "error", message: err.message });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler
app.use(errorHandler);

export default app;
