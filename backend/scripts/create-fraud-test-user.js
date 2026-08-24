import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOneAndUpdate(
      { email: "fraudtest@veloop.local" },
      {
        email: "fraudtest@veloop.local",
        referralCode: "FRAUDTEST01",
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("Fraud test user:");
    console.log({
      id: user._id.toString(),
      email: user.email,
      referralCode: user.referralCode,
    });
  } catch (error) {
    console.error("Failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();