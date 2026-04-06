"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendor_controller_1 = require("./vendor.controller");
const router = (0, express_1.Router)();
router.get("/", vendor_controller_1.getAll);
router.get("/:id", vendor_controller_1.getById);
router.post("/", vendor_controller_1.create);
router.put("/:id", vendor_controller_1.update);
router.delete("/:id", vendor_controller_1.remove);
exports.default = router;
//# sourceMappingURL=vendor.routes.js.map