import "dotenv/config";
import mongoose from "mongoose";

import { recordAdEvent } from "../src/services/adEvent.service.js";
import ReferralProgress from "../src/models/ReferralProgress.js";

const USER_ID = "6a8c688f6a852907a2763394";
const REFERRAL_ID = "6a8c9b859afc659961ad8100";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const progressBefore = await ReferralProgress.findOne({
      referralId: REFERRAL_ID,
    }).lean();

    console.log(
      "Starting eligible ads:",
      progressBefore?.eligibleAdsWatched
    );

    for (let i = 3; i <= 15; i++) {
      await recordAdEvent({
        eventId: `milestone-test-ad-${String(i).padStart(3, "0")}`,
        userId: USER_ID,
        eventType: "VIDEO_AD_COMPLETED",
        eligible: true,
        occurredAt: new Date(),
      });

      console.log(`Eligible ad ${i} recorded`);
    }

    const progressAfter = await ReferralProgress.findOne({
      referralId: REFERRAL_ID,
    }).lean();

    console.log("Final eligible ads:", progressAfter?.eligibleAdsWatched);
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();