import { Router } from "express";
import { register, login, refresh, logout, me } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

const router = Router();

router.post(
  "/register",
  validate([
    { field: "email", required: true, type: "string" },
    { field: "phone", required: true, type: "string" },
    { field: "password", required: true, type: "string", minLength: 6 },
    { field: "firstName", required: true, type: "string" },
    { field: "lastName", required: true, type: "string" },
  ]),
  register
);

router.post(
  "/login",
  validate([
    { field: "email", required: true, type: "string" },
    { field: "password", required: true, type: "string" },
  ]),
  login
);

router.post(
  "/refresh",
  validate([{ field: "refreshToken", required: true, type: "string" }]),
  refresh
);

router.post("/logout", authenticate, logout);

router.get("/me", authenticate, me);

export default router;
