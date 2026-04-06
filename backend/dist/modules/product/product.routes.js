"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const router = (0, express_1.Router)();
router.get("/", product_controller_1.getAll);
router.get("/active", product_controller_1.getActive);
router.get("/filters", product_controller_1.getFilters);
router.get("/low-stock", product_controller_1.getLowStock);
router.get("/inventory-summary", product_controller_1.getInventorySummary);
router.get("/:id", product_controller_1.getById);
router.post("/", product_controller_1.create);
router.put("/:id", product_controller_1.update);
router.delete("/:id", product_controller_1.remove);
exports.default = router;
//# sourceMappingURL=product.routes.js.map