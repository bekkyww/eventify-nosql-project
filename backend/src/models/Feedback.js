import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, default: "" }
  },
  { timestamps: true }
);

FeedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Feedback", FeedbackSchema);
