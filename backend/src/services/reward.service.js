import mongoose from "mongoose";
import ReferralProgress from "../models/ReferralProgress.js";
import Referral from "../models/Referral.js";
import RewardMilestone from "../models/RewardMilestone.js";
import ReferralReward from "../models/ReferralReward.js";
import RewardTransaction from "../models/RewardTransaction.js";
import User from "../models/User.js";

const processReferralRewards = async (referralId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Find the referral
    const referral = await Referral.findById(referralId).session(session);

    if (!referral) {
      throw new Error("Referral not found");
    }

    // 2. Find referral progress
    const progress = await ReferralProgress.findOne({
      referralId,
    }).session(session);

    if (!progress) {
      throw new Error("Referral progress not found");
    }

    // 3. Only pending referrals can earn ad-watch rewards
    if (referral.status !== "PENDING") {
      await session.commitTransaction();
      return [];
    }

    // 4. Find active milestones the user has reached
    const milestones = await RewardMilestone.find({
      isActive: true,
      requiredAds: {
        $ne: null,
        $lte: progress.eligibleAdsWatched,
      },
    })
      .sort({ requiredAds: 1 })
      .session(session);

    const rewardsCreated = [];

    // 5. Process each reached milestone
    for (const milestone of milestones) {
      // Prevent duplicate reward for this milestone
      const existingReward = await ReferralReward.findOne({
        referralId,
        milestoneId: milestone._id,
      }).session(session);

      if (existingReward) {
        continue;
      }

      // 6. Determine which User balance field should be updated
      const balanceFieldMap = {
        SVE: "balances.sve",
        SPINS: "balances.spins",
        TOKENS: "balances.tokens",
        GEMS: "balances.gems",
        XP: "balances.xp",
      };

      const balanceField = balanceFieldMap[milestone.rewardType];

      if (!balanceField) {
        throw new Error(`Unsupported reward type: ${milestone.rewardType}`);
      }

      // 7. Verify the user exists
      const user = await User.findById(referral.referrerUserId).session(
        session,
      );

      if (!user) {
        throw new Error("Reward recipient user not found");
      }

      // 8. Create referral reward
      const referralReward = new ReferralReward({
        referralId,
        referrerUserId: referral.referrerUserId,
        milestoneId: milestone._id,
        rewardType: milestone.rewardType,
        rewardAmount: milestone.rewardAmount,
        status: "CREDITED",
        creditedAt: new Date(),
      });

      await referralReward.save({ session });

      // 9. Create reward transaction
      const rewardTransaction = new RewardTransaction({
        userId: referral.referrerUserId,
        referralId,
        referralRewardId: referralReward._id,
        rewardType: milestone.rewardType,
        amount: milestone.rewardAmount,
        direction: "CREDIT",
        status: "COMPLETED",
        idempotencyKey: `${referralId}-${milestone._id}`,
        reason: milestone.name,
        processedAt: new Date(),
      });

      await rewardTransaction.save({ session });

      // 10. Update the user's actual balance
      await User.updateOne(
        {
          _id: referral.referrerUserId,
        },
        {
          $inc: {
            [balanceField]: milestone.rewardAmount,
          },
        },
        {
          session,
        },
      );

      rewardsCreated.push(referralReward);
    }

    // 11. Commit all changes
    await session.commitTransaction();

    return rewardsCreated;
  } catch (error) {
    // Roll back everything if any operation fails
    await session.abortTransaction();

    throw error;
  } finally {
    // Always close the session
    await session.endSession();
  }
};

export { processReferralRewards };
