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

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler
app.use(errorHandler);

export default app;
