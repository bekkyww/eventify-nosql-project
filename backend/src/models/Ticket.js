import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["registered", "cancelled"], default: "registered", index: true }
  },
  { timestamps: true }
);

TicketSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Ticket", TicketSchema);
