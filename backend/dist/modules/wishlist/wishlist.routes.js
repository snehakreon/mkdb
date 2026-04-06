"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_1 = require("./wishlist.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", wishlist_controller_1.getAll);
router.post("/", wishlist_controller_1.add);
router.delete("/:productId", wishlist_controller_1.remove);
router.get("/check/:productId", wishlist_controller_1.check);
exports.default = router;
//# sourceMappingURL=wishlist.routes.js.map