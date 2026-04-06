"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zone_controller_1 = require("./zone.controller");
const router = (0, express_1.Router)();
router.get("/", zone_controller_1.getAll);
router.get("/:id", zone_controller_1.getById);
router.post("/", zone_controller_1.create);
router.put("/:id", zone_controller_1.update);
router.delete("/:id", zone_controller_1.remove);
exports.default = router;
//# sourceMappingURL=zone.routes.js.map