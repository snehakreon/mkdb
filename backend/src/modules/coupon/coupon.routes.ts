import { Router } from "express";
import { validate, getAll, create, update, remove } from "./coupon.controller";

const router = Router();

router.post("/validate", validate);
router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
