import { Router } from "express";
import { getAll, add, remove, check } from "./wishlist.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getAll);
router.post("/", add);
router.delete("/:productId", remove);
router.get("/check/:productId", check);

export default router;
