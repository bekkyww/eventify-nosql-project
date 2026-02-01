import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  myTickets,
  registerToEvent,
  cancelRegistration,
  checkinUser,
  leaveFeedback
} from "../controllers/tickets.controller.js";

const router = Router();

router.get("/mine", requireAuth, myTickets);

// attendee registers/cancels
router.post("/register/:eventId", requireAuth, requireRole("attendee", "admin", "organizer"), registerToEvent);
router.post("/cancel/:eventId", requireAuth, requireRole("attendee", "admin", "organizer"), cancelRegistration);

// organizer check-in
router.post("/checkin/:eventId/:userId", requireAuth, requireRole("organizer", "admin"), checkinUser);

// attendee feedback
router.post("/feedback/:eventId", requireAuth, requireRole("attendee", "admin", "organizer"), leaveFeedback);

export default router;
