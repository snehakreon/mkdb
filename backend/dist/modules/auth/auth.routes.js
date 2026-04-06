"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
router.post("/register", (0, validate_middleware_1.validate)([
    { field: "email", required: true, type: "string" },
    { field: "phone", required: true, type: "string" },
    { field: "password", required: true, type: "string", minLength: 6 },
    { field: "firstName", required: true, type: "string" },
    { field: "lastName", required: true, type: "string" },
]), auth_controller_1.register);
router.post("/login", (0, validate_middleware_1.validate)([
    { field: "email", required: true, type: "string" },
    { field: "password", required: true, type: "string" },
]), auth_controller_1.login);
router.post("/refresh", (0, validate_middleware_1.validate)([{ field: "refreshToken", required: true, type: "string" }]), auth_controller_1.refresh);
router.post("/logout", auth_middleware_1.authenticate, auth_controller_1.logout);
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.me);
router.get("/account-summary", auth_middleware_1.authenticate, auth_controller_1.accountSummary);
router.put("/profile", auth_middleware_1.authenticate, auth_controller_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map