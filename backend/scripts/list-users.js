import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = await User.find({})
      .select("_id email referralCode")
      .lean();

    console.log("Users:");
    console.log(users);
  } catch (error) {
    console.error("Failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();