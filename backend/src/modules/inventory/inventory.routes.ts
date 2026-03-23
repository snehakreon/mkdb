import { Router } from "express";
import { getStockLevels, getSummary, getTransactions, updateStock } from "./inventory.controller";

const router = Router();

router.get("/", getStockLevels);
router.get("/summary", getSummary);
router.get("/transactions", getTransactions);
router.put("/:productId", updateStock);

export default router;
