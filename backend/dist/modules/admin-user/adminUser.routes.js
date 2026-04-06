"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminUser_controller_1 = require("./adminUser.controller");
const router = (0, express_1.Router)();
router.get("/", adminUser_controller_1.getAll);
router.post("/", adminUser_controller_1.create);
router.put("/:id", adminUser_controller_1.update);
router.delete("/:id", adminUser_controller_1.remove);
exports.default = router;
//# sourceMappingURL=adminUser.routes.js.map