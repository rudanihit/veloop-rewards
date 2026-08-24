import mongoose from "mongoose";

const userDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    deviceIdHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    firstSeenAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
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

userDeviceSchema.index({
  userId: 1,
  deviceIdHash: 1,
});

const UserDevice = mongoose.model("UserDevice", userDeviceSchema);

export default UserDevice;