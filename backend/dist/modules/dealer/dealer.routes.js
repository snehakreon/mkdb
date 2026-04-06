"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dealer_controller_1 = require("./dealer.controller");
const router = (0, express_1.Router)();
router.get("/", dealer_controller_1.getAll);
router.get("/:id", dealer_controller_1.getById);
router.post("/", dealer_controller_1.create);
router.put("/:id", dealer_controller_1.update);
router.delete("/:id", dealer_controller_1.remove);
exports.default = router;
//# sourceMappingURL=dealer.routes.js.map