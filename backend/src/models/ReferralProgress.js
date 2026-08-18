import mongoose from "mongoose";

const referralProgressSchema = new mongoose.Schema(
  {
    referralId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Referral",
  required: true,
  unique: true,
},

    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    eligibleAdsWatched: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastVerifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ReferralProgress = mongoose.model(
  "ReferralProgress",
  referralProgressSchema
);

export default ReferralProgress;