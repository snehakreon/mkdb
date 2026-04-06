"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const brand_controller_1 = require("./brand.controller");
const router = (0, express_1.Router)();
router.get("/", brand_controller_1.getAll);
router.post("/", brand_controller_1.create);
router.put("/:id", brand_controller_1.update);
router.delete("/:id", brand_controller_1.remove);
exports.default = router;
//# sourceMappingURL=brand.routes.js.map