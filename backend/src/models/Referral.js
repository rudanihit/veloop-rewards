import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    referralCode: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "SUCCESSFUL",
        "SPAM",
        "REJECTED",
        "FRAUD_REVIEW",
      ],
      default: "PENDING",
    },

    attributionSource: {
      type: String,
      trim: true,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
referralSchema.index({ referrerUserId: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;