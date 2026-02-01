import mongoose from "mongoose";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import Checkin from "../models/Checkin.js";
import Feedback from "../models/Feedback.js";

function isOwnerOrAdmin(req, event) {
  return req.user.role === "admin" || event.ownerId.toString() === req.user._id.toString();
}

export async function listEvents(req, res, next) {
  try {
    const { q, city, tag, from, to, status } = req.query;

    const filter = { deletedAt: null, status: status || "published" };

    if (city) filter.city = city;
    if (tag) filter.tags = tag;
    if (from || to) {
      filter.startAt = {};
      if (from) filter.startAt.$gte = new Date(from);
      if (to) filter.startAt.$lte = new Date(to);
    }

    let query = Event.find(filter).sort({ startAt: 1 }).limit(50);

    if (q) {
      query = Event.find(
        { ...filter, $text: { $search: q } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" }, startAt: 1 }).limit(50);
    }

    const events = await query.select("-__v");
    res.json({ events });
  } catch (e) {
    next(e);
  }
}

export async function getEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, deletedAt: null }).select("-__v");
    if (!event) return res.status(404).json({ error: "Event not found" });

    // advanced update: increment views
    await Event.updateOne({ _id: id }, { $inc: { "counters.views": 1 } });

    const ratingAgg = await Feedback.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$eventId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    res.json({
      event,
      rating: ratingAgg[0] ? { avg: ratingAgg[0].avgRating, count: ratingAgg[0].count } : { avg: null, count: 0 }
    });
  } catch (e) {
    next(e);
  }
}

export async function createEvent(req, res, next) {
  try {
    const {
      title, description, city, place, startAt, endAt,
      capacity, tags, schedule
    } = req.body;

    const event = await Event.create({
      ownerId: req.user._id,
      title,
      description: description || "",
      city,
      place: place || "",
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      capacity: capacity ?? 50,
      tags: tags || [],
      schedule: (schedule || []).map(s => ({ title: s.title, time: new Date(s.time) })),
      status: "draft"
    });

    res.status(201).json({ event });
  } catch (e) {
    next(e);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event || event.deletedAt) return res.status(404).json({ error: "Event not found" });
    if (!isOwnerOrAdmin(req, event)) return res.status(403).json({ error: "Forbidden" });

    // advanced update with $set + $push/$pull can be done by body flags, keep simple:
    const patch = {};
    const allowed = ["title", "description", "city", "place", "startAt", "endAt", "capacity", "tags"];
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    if (patch.startAt) patch.startAt = new Date(patch.startAt);
    if (patch.endAt) patch.endAt = new Date(patch.endAt);

    await Event.updateOne({ _id: id }, { $set: patch });
    const updated = await Event.findById(id).select("-__v");
    res.json({ event: updated });
  } catch (e) {
    next(e);
  }
}

export async function publishEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event || event.deletedAt) return res.status(404).json({ error: "Event not found" });
    if (!isOwnerOrAdmin(req, event)) return res.status(403).json({ error: "Forbidden" });

    await Event.updateOne({ _id: id }, { $set: { status: "published" } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function closeEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event || event.deletedAt) return res.status(404).json({ error: "Event not found" });
    if (!isOwnerOrAdmin(req, event)) return res.status(403).json({ error: "Forbidden" });

    await Event.updateOne({ _id: id }, { $set: { status: "closed" } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function softDeleteEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event || event.deletedAt) return res.status(404).json({ error: "Event not found" });
    if (!isOwnerOrAdmin(req, event)) return res.status(403).json({ error: "Forbidden" });

    await Event.updateOne({ _id: id }, { $set: { deletedAt: new Date(), status: "closed" } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function addScheduleItem(req, res, next) {
  try {
    const { id } = req.params;
    const { title, time } = req.body;

    const event = await Event.findById(id);
    if (!event || event.deletedAt) return res.status(404).json({ error: "Event not found" });
    if (!isOwnerOrAdmin(req, event)) return res.status(403).json({ error: "Forbidden" });

    // advanced update: $push embedded schedule item
    await Event.updateOne(
      { _id: id },
      { $push: { schedule: { title, time: new Date(time) } } }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function removeScheduleItem(req, res, next) {
  try {
    const { id, timeIso } = req.params;
    const event = await Event.findById(id);
    if (!event || event.deletedAt) return res.status(404).json({ error: "Event not found" });
    if (!isOwnerOrAdmin(req, event)) return res.status(403).json({ error: "Forbidden" });

    // advanced update: $pull from embedded schedule by time
    await Event.updateOne(
      { _id: id },
      { $pull: { schedule: { time: new Date(timeIso) } } }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

// Aggregation: stats for a single event
export async function statsForEvent(req, res, next) {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event || event.deletedAt) return res.status(404).json({ error: "Event not found" });
    if (!isOwnerOrAdmin(req, event)) return res.status(403).json({ error: "Forbidden" });

    const eventId = new mongoose.Types.ObjectId(id);

    const [regAgg] = await Ticket.aggregate([
      { $match: { eventId, status: "registered" } },
      { $group: { _id: "$eventId", registered: { $sum: 1 } } }
    ]);

    const [checkAgg] = await Checkin.aggregate([
      { $match: { eventId } },
      { $group: { _id: "$eventId", checkedIn: { $sum: 1 } } }
    ]);

    const [ratingAgg] = await Feedback.aggregate([
      { $match: { eventId } },
      { $group: { _id: "$eventId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const registered = regAgg?.registered || 0;
    const checkedIn = checkAgg?.checkedIn || 0;
    const conversion = registered ? checkedIn / registered : 0;

    res.json({
      registered,
      checkedIn,
      conversion,
      rating: ratingAgg ? { avg: ratingAgg.avgRating, count: ratingAgg.count } : { avg: null, count: 0 }
    });
  } catch (e) {
    next(e);
  }
}
