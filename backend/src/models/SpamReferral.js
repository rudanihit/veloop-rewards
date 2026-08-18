import mongoose from "mongoose";

const spamReferralSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
      unique: true,
    },

    referrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "DISMISSED"],
      default: "PENDING",
      index: true,
    },

    reviewedAt: {
      type: Date,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

spamReferralSchema.index({ referrerUserId: 1 });
spamReferralSchema.index({ referredUserId: 1 });
spamReferralSchema.index({ status: 1 });

const SpamReferral = mongoose.model(
  "SpamReferral",
  spamReferralSchema
);

export default SpamReferral;