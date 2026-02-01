import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./config/db.js";
import User from "./models/User.js";
import Event from "./models/Event.js";

await connectDb(process.env.MONGODB_URI);

async function upsertUser({ email, name, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  const passwordHash = await User.hashPassword(password);
  return User.create({ email, name, passwordHash, role });
}

const organizer = await upsertUser({
  email: "org@example.com",
  name: "Organizer One",
  password: "password123",
  role: "organizer"
});

const attendee = await upsertUser({
  email: "att@example.com",
  name: "Attendee One",
  password: "password123",
  role: "attendee"
});

const admin = await upsertUser({
  email: "admin@example.com",
  name: "Admin",
  password: "password123",
  role: "admin"
});

const existsEvent = await Event.findOne({ title: "Almaty Tech Meetup" });
if (!existsEvent) {
  await Event.create({
    ownerId: organizer._id,
    title: "Almaty Tech Meetup",
    description: "Meetup about web dev + MongoDB. Bring your laptop.",
    city: "Almaty",
    place: "Coworking Hub",
    startAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
    endAt: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
    capacity: 60,
    tags: ["mongodb", "react", "networking"],
    schedule: [
      { title: "Welcome", time: new Date(Date.now() + 2 * 24 * 3600 * 1000) },
      { title: "Talk: Mongo indexes", time: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 30 * 60 * 1000) }
    ],
    status: "published"
  });
}

console.log("✅ Seed done.");
console.log("Organizer: org@example.com / password123");
console.log("Attendee:  att@example.com / password123");
console.log("Admin:     admin@example.com / password123");

process.exit(0);
