"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = require("./coupon.controller");
const router = (0, express_1.Router)();
router.post("/validate", coupon_controller_1.validate);
router.get("/", coupon_controller_1.getAll);
router.post("/", coupon_controller_1.create);
router.put("/:id", coupon_controller_1.update);
router.delete("/:id", coupon_controller_1.remove);
exports.default = router;
//# sourceMappingURL=coupon.routes.js.map