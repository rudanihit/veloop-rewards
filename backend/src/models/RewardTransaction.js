import mongoose from "mongoose";

const rewardTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },

    referralRewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralReward",
    },

    rewardType: {
      type: String,
      enum: ["SVE", "SPINS", "TOKENS", "GEMS", "XP"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    direction: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      default: "PENDING",
      index: true,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

rewardTransactionSchema.index({
  userId: 1,
  rewardType: 1,
  createdAt: -1,
});

const RewardTransaction = mongoose.model(
  "RewardTransaction",
  rewardTransactionSchema
);

export default RewardTransaction;