import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    referralCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    balances: {
      sve: {
        type: Number,
        default: 0,
        min: 0,
      },
      spins: {
        type: Number,
        default: 0,
        min: 0,
      },
      tokens: {
        type: Number,
        default: 0,
        min: 0,
      },
      gems: {
        type: Number,
        default: 0,
        min: 0,
      },
      xp: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
