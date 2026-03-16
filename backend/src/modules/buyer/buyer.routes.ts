import { Router } from "express";
import { getAll, getById, create, update, remove, getProjects } from "./buyer.controller";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.get("/:id/projects", getProjects);

export default router;
