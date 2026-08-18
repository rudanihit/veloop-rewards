import mongoose from "mongoose";

const adEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    eligible: {
      type: Boolean,
      default: false,
    },

    occurredAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

adEventSchema.index({ userId: 1, occurredAt: -1 });
adEventSchema.index({ status: 1 });

const AdEvent = mongoose.model("AdEvent", adEventSchema);

export default AdEvent;
