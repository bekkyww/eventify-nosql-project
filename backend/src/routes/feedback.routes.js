import { Router } from "express";
import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import User from "../models/User.js";

const r = Router();

// ✅ GET comments list
r.get("/events/:id/feedback", async (req, res) => {
  const eventId = new mongoose.Types.ObjectId(req.params.id);

  const items = await Feedback.find({ eventId }).sort({ createdAt: -1 }).limit(50).lean();

  // подтянем имя/почту (можешь убрать email)
  const userIds = [...new Set(items.map(x => String(x.userId)))];
  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } }, { name: 1, email: 1 }).lean()
    : [];
  const byId = new Map(users.map(u => [String(u._id), u]));

  res.json({
    feedback: items.map(f => ({
      _id: f._id,
      rating: f.rating,
      text: f.text,
      createdAt: f.createdAt,
      userName: byId.get(String(f.userId))?.name,
      userEmail: byId.get(String(f.userId))?.email,
    })),
  });
});

// ✅ Aggregation summary (avg/count + stars distribution)
r.get("/events/:id/feedback/summary", async (req, res) => {
  const eventId = new mongoose.Types.ObjectId(req.params.id);

  const agg = await Feedback.aggregate([
    { $match: { eventId } },
    {
      $group: {
        _id: "$eventId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
        s1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        s2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        s3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        s4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        s5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        avg: { $round: ["$avg", 2] },
        count: 1,
        stars: { "1": "$s1", "2": "$s2", "3": "$s3", "4": "$s4", "5": "$s5" },
      },
    },
  ]);

  res.json(agg[0] || { avg: 0, count: 0, stars: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } });
});

export default r;
