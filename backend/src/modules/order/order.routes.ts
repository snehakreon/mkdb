import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import {
  getAll, getById, create, update, remove,
  getMyOrders, getMyOrderDetail,
  transitionStatus, getStatusHistory
} from "./order.controller";

const router = Router();

// Buyer's own orders (auth required)
router.get("/my", authenticate, getMyOrders);
router.get("/my/:id", authenticate, getMyOrderDetail);

// General CRUD
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
router.delete("/:id", remove);

// Order workflow
router.post("/:id/transition", authenticate, transitionStatus);
router.get("/:id/history", getStatusHistory);

export default router;
