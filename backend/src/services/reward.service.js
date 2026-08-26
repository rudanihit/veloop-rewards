import mongoose from "mongoose";
import ReferralProgress from "../models/ReferralProgress.js";
import Referral from "../models/Referral.js";
import RewardMilestone from "../models/RewardMilestone.js";
import ReferralReward from "../models/ReferralReward.js";
import RewardTransaction from "../models/RewardTransaction.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { createAuditLog } from "./auditLog.service.js";

const processReferralRewards = async (referralId, session = null) => {
  const ownSession = !session;
  const currentSession = session || (await mongoose.startSession());

  try {
    if (ownSession) {
      currentSession.startTransaction();
    }

    // 1. Find the referral
    const referral = await Referral.findById(referralId).session(
      currentSession,
    );

    if (!referral) {
      throw new ApiError(404, "Referral not found", "REFERRAL_NOT_FOUND");
    }

    // 2. Find referral progress
    const progress = await ReferralProgress.findOne({
      referralId,
    }).session(currentSession);

    if (!progress) {
      throw new ApiError(
        404,
        "Referral progress not found",
        "REFERRAL_PROGRESS_NOT_FOUND",
      );
    }

    // 3. Only pending referrals can earn ad-watch rewards
    if (referral.status !== "PENDING") {
      if (ownSession) {
        await currentSession.commitTransaction();
      }

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
      .session(currentSession);

    const rewardsCreated = [];

    // 5. Process each reached milestone
    for (const milestone of milestones) {
      // Prevent duplicate reward for this milestone
      const existingReward = await ReferralReward.findOne({
        referralId,
        milestoneId: milestone._id,
      }).session(currentSession);

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
        throw new ApiError(
          500,
          `Unsupported reward type: ${milestone.rewardType}`,
          "UNSUPPORTED_REWARD_TYPE",
        );
      }

      // 7. Verify the user exists
      const user = await User.findById(
        referral.referrerUserId,
      ).session(currentSession);

      if (!user) {
        throw new ApiError(
          404,
          "Reward recipient user not found",
          "REWARD_RECIPIENT_NOT_FOUND",
        );
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

      await referralReward.save({
        session: currentSession,
      });

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

      await rewardTransaction.save({
        session: currentSession,
      });

      // 10. Create audit log
      await createAuditLog({
        action: "REWARD_CREDITED",
        userId: referral.referrerUserId,
        referralId,
        metadata: {
          referralRewardId: referralReward._id,
          rewardTransactionId: rewardTransaction._id,
          rewardType: milestone.rewardType,
          rewardAmount: milestone.rewardAmount,
          milestoneId: milestone._id,
          milestoneName: milestone.name,
        },
        session: currentSession,
      });

      // 11. Update the user's actual balance
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
          session: currentSession,
        },
      );

      rewardsCreated.push(referralReward);
    }

    // 12. Commit only if this service created the transaction
    if (ownSession) {
      await currentSession.commitTransaction();
    }

    return rewardsCreated;
  } catch (error) {
    // Only abort if this service owns the transaction
    if (ownSession && currentSession.inTransaction()) {
      await currentSession.abortTransaction();
    }

    throw error;
  } finally {
    // Only end the session if this service created it
    if (ownSession) {
      await currentSession.endSession();
    }
  }
};

export { processReferralRewards };