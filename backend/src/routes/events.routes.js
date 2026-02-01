import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  publishEvent,
  closeEvent,
  softDeleteEvent,
  addScheduleItem,
  removeScheduleItem,
  statsForEvent
} from "../controllers/events.controller.js";
import Event from "../models/Event.js";

const router = Router();

router.get("/", listEvents);
router.get("/:id", getEvent);

router.post("/", requireAuth, requireRole("organizer", "admin"), createEvent);
router.patch("/:id", requireAuth, requireRole("organizer", "admin"), updateEvent);

router.post("/:id/publish", requireAuth, requireRole("organizer", "admin"), publishEvent);
router.post("/:id/close", requireAuth, requireRole("organizer", "admin"), closeEvent);

router.post("/:id/schedule", requireAuth, requireRole("organizer", "admin"), addScheduleItem);
router.delete("/:id/schedule/:timeIso", requireAuth, requireRole("organizer", "admin"), removeScheduleItem);

router.delete("/:id", requireAuth, requireRole("organizer", "admin"), softDeleteEvent);

router.get("/:id/stats", requireAuth, requireRole("organizer", "admin"), statsForEvent);

export default router;

router.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }
    const event = await Event.findOne({ _id: id, deletedAt: null }).lean();
    if (!event) return res.status(404).json({ error: "Event not found" });
    const agg = await Feedback.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$eventId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      { $project: { _id: 0, avg: { $ifNull: ["$avg", 0] }, count: 1 } },
    ]);

    const rating = agg[0] || { avg: 0, count: 0 };

    return res.json({ event, rating });
  } catch (e) {
    console.error("GET /events/:id error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});
