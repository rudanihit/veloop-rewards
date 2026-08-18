import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateDevToken = async (email) => {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new Error("Development user not found");
  }

  // Initialize balances for existing users
  const existingUser = await User.findById(user._id).lean();

  if (!existingUser.balances) {
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          balances: {
            sve: 0,
            spins: 0,
            tokens: 0,
            gems: 0,
            xp: 0,
          },
        },
      }
    );

    console.log("BALANCES INITIALIZED IN DATABASE");
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      referralCode: user.referralCode,
      balances: user.balances,
    },
  };
};

export {
  generateDevToken,
};