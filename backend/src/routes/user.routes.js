import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { getMe, getUserById, updateMe } from "../controllers/user.controller.js";

const router = Router();

router.get("/profile", protect, getMe);
router.patch("/profile", protect, updateMe);
router.get("/:id", protect, adminOnly, getUserById);

export default router;
