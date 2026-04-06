"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
// Buyer's own orders (auth required)
router.get("/my", auth_middleware_1.authenticate, order_controller_1.getMyOrders);
router.get("/my/:id", auth_middleware_1.authenticate, order_controller_1.getMyOrderDetail);
// General CRUD
router.get("/", order_controller_1.getAll);
router.get("/:id", order_controller_1.getById);
router.post("/", auth_middleware_1.authenticate, order_controller_1.create);
router.put("/:id", auth_middleware_1.authenticate, order_controller_1.update);
router.delete("/:id", order_controller_1.remove);
// Order workflow
router.post("/:id/transition", auth_middleware_1.authenticate, order_controller_1.transitionStatus);
router.get("/:id/history", order_controller_1.getStatusHistory);
exports.default = router;
//# sourceMappingURL=order.routes.js.map