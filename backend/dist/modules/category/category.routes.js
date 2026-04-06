"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const router = (0, express_1.Router)();
router.get("/", category_controller_1.getAll);
router.get("/active", category_controller_1.getActive);
router.post("/", category_controller_1.create);
router.post("/reorganize", category_controller_1.reorganize);
router.put("/:id", category_controller_1.update);
router.delete("/:id", category_controller_1.remove);
exports.default = router;
//# sourceMappingURL=category.routes.js.map