import { Router } from "express";
import { getAll, getProjects } from "./buyer.controller";

const router = Router();

router.get("/", getAll);
router.get("/:id/projects", getProjects);

export default router;
