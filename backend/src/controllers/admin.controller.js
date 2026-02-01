import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import Checkin from "../models/Checkin.js";
import Feedback from "../models/Feedback.js";

export async function globalStats(req, res, next) {
  try {
    const topCities = await Event.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: "$city", events: { $sum: 1 } } },
      { $sort: { events: -1 } },
      { $limit: 10 }
    ]);

    const ratings = await Feedback.aggregate([
      { $group: { _id: "$eventId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      { $sort: { avg: -1, count: -1 } },
      { $limit: 10 }
    ]);

    const totals = {
      events: await Event.countDocuments({ deletedAt: null }),
      tickets: await Ticket.countDocuments(),
      checkins: await Checkin.countDocuments(),
      feedbacks: await Feedback.countDocuments()
    };

    res.json({ totals, topCities, topRated: ratings });
  } catch (e) {
    next(e);
  }
}
