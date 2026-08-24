import "dotenv/config";
import mongoose from "mongoose";
import ReferralReward from "../src/models/ReferralReward.js";
import RewardMilestone from "../src/models/RewardMilestone.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const rewards = await ReferralReward.find({
      referralId: "6a8c9b859afc659961ad8100",
    })
      .populate("milestoneId", "name requiredAds")
      .lean();

    console.log("Referral rewards:");
    console.log(rewards);
  } catch (error) {
    console.error("Failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();