"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
router.get("/stats", dashboard_controller_1.getStats);
router.get("/orders-by-status", dashboard_controller_1.getOrdersByStatus);
router.get("/revenue-by-month", dashboard_controller_1.getRevenueByMonth);
router.get("/top-products", dashboard_controller_1.getTopProducts);
router.get("/recent-orders", dashboard_controller_1.getRecentOrders);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map