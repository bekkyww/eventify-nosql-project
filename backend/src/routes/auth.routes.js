import { Router } from "express";
import { validateBody } from "../utils/validate.js";
import { z } from "zod";
import { login, register, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
  role: z.enum(["attendee", "organizer"]).optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

router.post("/register", validateBody(RegisterSchema), register);
router.post("/login", validateBody(LoginSchema), login);
router.get("/me", requireAuth, me);

export default router;
