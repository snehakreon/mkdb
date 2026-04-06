"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("./inventory.controller");
const router = (0, express_1.Router)();
router.get("/", inventory_controller_1.getStockLevels);
router.get("/summary", inventory_controller_1.getSummary);
router.get("/transactions", inventory_controller_1.getTransactions);
router.put("/:productId", inventory_controller_1.updateStock);
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map