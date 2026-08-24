import crypto from "crypto";
import UserDevice from "../models/UserDevice.js";

const hashDeviceId = (deviceId) => {
  return crypto
    .createHash("sha256")
    .update(deviceId)
    .digest("hex");
};

const registerDevice = async ({ userId, deviceId }) => {
  if (!deviceId) {
    throw new Error("deviceId is required");
  }

  const deviceIdHash = hashDeviceId(deviceId);

  const existingDevice = await UserDevice.findOne({
    deviceIdHash,
  });

  // Device already belongs to this user
  if (existingDevice) {
    if (existingDevice.userId.toString() === userId.toString()) {
      existingDevice.lastSeenAt = new Date();
      await existingDevice.save();

      return {
        deviceIdHash: existingDevice.deviceIdHash,
        isNewDevice: false,
        associatedUserId: existingDevice.userId,
      };
    }

    // Device belongs to another account
    return {
      deviceIdHash,
      isNewDevice: false,
      associatedUserId: existingDevice.userId,
      isAssociatedWithAnotherUser: true,
    };
  }

  // First time this device is seen
  const device = await UserDevice.create({
    userId,
    deviceIdHash,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    isActive: true,
  });

  return {
    deviceIdHash: device.deviceIdHash,
    isNewDevice: true,
    associatedUserId: device.userId,
    isAssociatedWithAnotherUser: false,
  };
};

export {
  hashDeviceId,
  registerDevice,
};