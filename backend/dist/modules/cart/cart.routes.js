"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const cart_controller_1 = require("./cart.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", cart_controller_1.getCart);
router.post("/", cart_controller_1.addItem);
router.post("/sync", cart_controller_1.syncCart);
router.put("/:productId", cart_controller_1.updateItem);
router.delete("/clear", cart_controller_1.clearCart);
router.delete("/:productId", cart_controller_1.removeItem);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map