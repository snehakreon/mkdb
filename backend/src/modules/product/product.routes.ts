import { Router } from "express";
import { getAll, getActive, getFilters, getById, create, update, remove } from "./product.controller";

const router = Router();

router.get("/", getAll);
router.get("/active", getActive);
router.get("/filters", getFilters);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
