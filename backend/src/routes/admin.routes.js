import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { globalStats } from "../controllers/admin.controller.js";

const router = Router();

router.get("/stats", requireAuth, requireRole("admin"), globalStats);

export default router;
