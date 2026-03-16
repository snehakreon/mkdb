import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getCart, addItem, updateItem, removeItem, clearCart, syncCart } from "./cart.controller";

const router = Router();

router.use(authenticate);

router.get("/", getCart);
router.post("/", addItem);
router.post("/sync", syncCart);
router.put("/:productId", updateItem);
router.delete("/clear", clearCart);
router.delete("/:productId", removeItem);

export default router;
