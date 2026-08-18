import mongoose from "mongoose";

const referralRewardSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
    },

    referrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RewardMilestone",
      required: true,
    },

    rewardType: {
      type: String,
      enum: ["SVE", "SPINS", "TOKENS", "GEMS", "XP"],
      required: true,
    },

    rewardAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "CREDITED", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    creditedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

referralRewardSchema.index({
  referralId: 1,
  milestoneId: 1,
}, {
  unique: true,
});

referralRewardSchema.index({ referrerUserId: 1 });
referralRewardSchema.index({ rewardType: 1 });

const ReferralReward = mongoose.model(
  "ReferralReward",
  referralRewardSchema
);

export default ReferralReward;