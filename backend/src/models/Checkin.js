import mongoose from "mongoose";

const CheckinSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkedInAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

CheckinSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Checkin", CheckinSchema);
