import { Router } from "express";
import { getStats, getOrdersByStatus, getRevenueByMonth, getTopProducts, getRecentOrders } from "./dashboard.controller";

const router = Router();

router.get("/stats", getStats);
router.get("/orders-by-status", getOrdersByStatus);
router.get("/revenue-by-month", getRevenueByMonth);
router.get("/top-products", getTopProducts);
router.get("/recent-orders", getRecentOrders);

export default router;
