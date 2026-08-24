import "dotenv/config";
import mongoose from "mongoose";
import SpamReferral from "../src/models/SpamReferral.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const spamReferral = await SpamReferral.findOne({
      referralId: "6a8c90e2fbf3c8c63b5f7ad9",
    }).lean();

    console.log("SpamReferral:");
    console.log(spamReferral);
  } catch (error) {
    console.error("Failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();