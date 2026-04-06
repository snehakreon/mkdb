"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = require("./address.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", address_controller_1.getAll);
router.post("/", address_controller_1.create);
router.put("/:id", address_controller_1.update);
router.delete("/:id", address_controller_1.remove);
exports.default = router;
//# sourceMappingURL=address.routes.js.map