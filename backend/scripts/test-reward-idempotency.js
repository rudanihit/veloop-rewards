import "dotenv/config";
import mongoose from "mongoose";

import { processReferralRewards } from "../src/services/reward.service.js";
import ReferralReward from "../src/models/ReferralReward.js";
import RewardTransaction from "../src/models/RewardTransaction.js";

const referralId = "6a8c9b859afc659961ad8100";
const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    const beforeRewards = await ReferralReward.countDocuments({
      referralId,
    });

    const beforeTransactions = await RewardTransaction.countDocuments({
      referralId,
    });

    console.log("Before:");
    console.log("Referral rewards:", beforeRewards);
    console.log("Reward transactions:", beforeTransactions);

    await processReferralRewards(referralId);

    const afterRewards = await ReferralReward.countDocuments({
      referralId,
    });

    const afterTransactions = await RewardTransaction.countDocuments({
      referralId,
    });

    console.log("After:");
    console.log("Referral rewards:", afterRewards);
    console.log("Reward transactions:", afterTransactions);

    if (
      beforeRewards === afterRewards &&
      beforeTransactions === afterTransactions
    ) {
      console.log("✅ Idempotency test PASSED");
      console.log("No duplicate reward was created.");
    } else {
      console.log("❌ Idempotency test FAILED");
      console.log("A duplicate reward may have been created.");
    }
  } catch (error) {
    console.error("Test failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

test();