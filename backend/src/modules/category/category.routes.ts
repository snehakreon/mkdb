import { Router } from "express";
import { getAll, getActive, create, update, remove, reorganize } from "./category.controller";

const router = Router();

router.get("/", getAll);
router.get("/active", getActive);
router.post("/", create);
router.post("/reorganize", reorganize);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
