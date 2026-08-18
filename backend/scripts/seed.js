import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import RewardMilestone from "../src/models/RewardMilestone.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    const developmentUser = await User.findOneAndUpdate(
      { email: "dev@veloop.local" },
      {
        email: "dev@veloop.local",
        phone: "9999999999",
        referralCode: "DEV12345",
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("Development user created/found:");
    console.log({
      id: developmentUser._id.toString(),
      email: developmentUser.email,
      referralCode: developmentUser.referralCode,
    });

    const referredUser = await User.findOneAndUpdate(
      { email: "referred@veloop.local" },
      {
        email: "referred@veloop.local",
        phone: "8888888888",
        referralCode: "REF88888",
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("Referred user created/found:");
    console.log({
      id: referredUser._id.toString(),
      email: referredUser.email,
      referralCode: referredUser.referralCode,
    });

    const milestones = [
  {
    name: "15 Ad Watch Milestone",
    rewardType: "SVE",
    rewardAmount: 5000,
    requiredAds: 15,
  },
  {
    name: "20 Ad Watch Milestone",
    rewardType: "SPINS",
    rewardAmount: 2,
    requiredAds: 20,
  },
  {
    name: "30 Ad Watch Milestone",
    rewardType: "TOKENS",
    rewardAmount: 5000,
    requiredAds: 30,
  },
  {
    name: "35 Ad Watch Milestone",
    rewardType: "GEMS",
    rewardAmount: 10,
    requiredAds: 35,
  },
  {
    name: "Successful Referral XP",
    rewardType: "XP",
    rewardAmount: 20,
  },
];

for (const milestone of milestones) {
  await RewardMilestone.findOneAndUpdate(
    { name: milestone.name },
    {
      ...milestone,
      isActive: true,
    },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
}

console.log("Reward milestones seeded successfully.");

    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();