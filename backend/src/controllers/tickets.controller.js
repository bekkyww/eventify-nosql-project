import mongoose from "mongoose";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import Checkin from "../models/Checkin.js";
import Feedback from "../models/Feedback.js";

async function ensureEventOpen(eventId) {
  const event = await Event.findById(eventId);
  if (!event || event.deletedAt) return { error: "Event not found" };
  if (event.status !== "published") return { error: "Event is not published" };
  return { event };
}

export async function myTickets(req, res, next) {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("eventId", "title city startAt status deletedAt");

    res.json({ tickets });
  } catch (e) {
    next(e);
  }
}

export async function registerToEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { event, error } = await ensureEventOpen(eventId);
    if (error) return res.status(400).json({ error });
  const eventUpdated = await Event.findOneAndUpdate(
    {
      _id: eventId,
     deletedAt: null,
      $expr: { $lt: ["$counters.registrations", "$capacity"] }
    },
    { $inc: { "counters.registrations": 1 } },
   { new: true }
  );

  if (!eventUpdated) {
  return res.status(409).json({ error: "Event is full" });
  }

  const ticket = await Ticket.findOneAndUpdate(
   { eventId, userId },
   { $setOnInsert: { status: "registered" } },
   { upsert: true, new: true }
  );

    // const registeredCount = await Ticket.countDocuments({ eventId, status: "registered" });
    // if (registeredCount >= event.capacity) return res.status(409).json({ error: "Event is full" });

    // const ticket = await Ticket.findOneAndUpdate(
    //   { eventId, userId: req.user._id },
    //   { $set: { status: "registered" } },
    //   { upsert: true, new: true }
    // );
    // await Event.updateOne({ _id: eventId }, { $inc: { "counters.registrations": 1 } });

    res.json({ ticket });
  } catch (e) {
    next(e);
  }
}

export async function cancelRegistration(req, res, next) {
  try {
    const { eventId } = req.params;

    const ticket = await Ticket.findOne({ eventId, userId: req.user._id });
    if (!ticket || ticket.status !== "registered") {
      return res.status(400).json({ error: "Not registered" });
    }

    await Ticket.updateOne({ _id: ticket._id }, { $set: { status: "cancelled" } });
    await Event.updateOne({ _id: eventId }, { $inc: { "counters.registrations": -1 } });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function checkinUser(req, res, next) {
  try {
    const { eventId, userId } = req.params;

    const event = await Event.findById(eventId);
    if (!event || event.deletedAt) return res.status(404).json({ error: "Event not found" });
    const isOwner = req.user.role === "admin" || event.ownerId.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ error: "Forbidden" });

    const ticket = await Ticket.findOne({ eventId, userId, status: "registered" });
    if (!ticket) return res.status(400).json({ error: "User not registered" });

    const checkin = await Checkin.findOneAndUpdate(
      { eventId, userId },
      { $setOnInsert: { checkedInBy: req.user._id, checkedInAt: new Date() } },
      { upsert: true, new: true }
    );
    const existed = await Checkin.countDocuments({ eventId, userId });
    await Event.updateOne({ _id: eventId }, { $inc: { "counters.checkins": 1 } });

    res.json({ checkin });
  } catch (e) {
    if (String(e).includes("E11000")) return res.status(409).json({ error: "Already checked in" });
    next(e);
  }
}

export async function leaveFeedback(req, res, next) {
  try {
    const { eventId } = req.params;
    const { rating, text } = req.body;

    const feedback = await Feedback.findOneAndUpdate(
      { eventId, userId: req.user._id },
      { $set: { rating, text: text || "" } },
      { upsert: true, new: true }
    );

    res.json({ feedback });
  } catch (e) {
    next(e);
  }
}
