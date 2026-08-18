import mongoose from "mongoose";

const rewardMilestoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

    requiredAds: {
      type: Number,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

rewardMilestoneSchema.index({
  requiredAds: 1,
  isActive: 1,
});

const RewardMilestone = mongoose.model(
  "RewardMilestone",
  rewardMilestoneSchema
);

export default RewardMilestone;