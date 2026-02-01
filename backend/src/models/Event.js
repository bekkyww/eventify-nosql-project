import mongoose from "mongoose";

const ScheduleItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    time: { type: Date, required: true }
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    city: { type: String, required: true, index: true },
    place: { type: String, default: "" },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    capacity: { type: Number, default: 50, min: 1 },
    tags: { type: [String], default: [] },          // embedded
    schedule: { type: [ScheduleItemSchema], default: [] }, // embedded
    status: { type: String, enum: ["draft", "published", "closed"], default: "draft", index: true },
    deletedAt: { type: Date, default: null, index: true },

    counters: {
      views: { type: Number, default: 0 },
      registrations: { type: Number, default: 0 },
      checkins: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Text search
EventSchema.index({ title: "text", description: "text", city: "text", tags: "text" });
// Common compound index
EventSchema.index({ city: 1, startAt: 1, status: 1 });

export default mongoose.model("Event", EventSchema);
