import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../src/models/User.js";
import { assessReferralRisk } from "../src/services/fraudDetection.service.js";

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const referrer = await User.findOne({
      email: "dev@veloop.local",
    });

    const referredUser = await User.findOne({
      email: "testreferred@veloop.local",
    });

    if (!referrer || !referredUser) {
      throw new Error("Test users not found");
    }

    const result = await assessReferralRisk({
      referrerUserId: referrer._id,
      referredUserId: referredUser._id,
      deviceId: "third-party-device-001",
    });

    console.log("Fraud assessment:");
    console.log(result);
  } catch (error) {
    console.error("Fraud test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

runTest();
