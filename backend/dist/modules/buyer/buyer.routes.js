"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const buyer_controller_1 = require("./buyer.controller");
const router = (0, express_1.Router)();
router.get("/", buyer_controller_1.getAll);
router.get("/:id", buyer_controller_1.getById);
router.post("/", buyer_controller_1.create);
router.put("/:id", buyer_controller_1.update);
router.delete("/:id", buyer_controller_1.remove);
router.get("/:id/projects", buyer_controller_1.getProjects);
exports.default = router;
//# sourceMappingURL=buyer.routes.js.map