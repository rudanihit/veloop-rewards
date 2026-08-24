import mongoose from "mongoose";
import User from "../models/User.js";
import Referral from "../models/Referral.js";
import ReferralProgress from "../models/ReferralProgress.js";
import RewardMilestone from "../models/RewardMilestone.js";
import ReferralReward from "../models/ReferralReward.js";
import RewardTransaction from "../models/RewardTransaction.js";
import { assessReferralRisk } from "./fraudDetection.service.js";
import SpamReferral from "../models/SpamReferral.js";

const createReferral = async ({
  referrerUserId,
  referredUserId,
  referralCode,
  attributionSource,
  deviceId,
}) => {
  // 1. Find the referrer using the referral code
  const referrer = await User.findOne({
    referralCode,
  });

  if (!referrer) {
    throw new Error("Invalid referral code");
  }

  // 2. A user cannot refer themselves
  if (referrer._id.toString() === referredUserId.toString()) {
    throw new Error("A user cannot refer themselves");
  }

  // 3. Make sure the referred user exists
  const referredUser = await User.findById(referredUserId);

  if (!referredUser) {
    throw new Error("Referred user not found");
  }

  // 4. Check whether this user has already been referred
  const existingReferral = await Referral.findOne({
    referredUserId,
  });

  if (existingReferral) {
    throw new Error("User has already been referred");
  }

  // 4.1. Assess referral fraud risk
  const riskAssessment = await assessReferralRisk({
    referrerUserId: referrer._id,
    referredUserId: referredUser._id,
    deviceId,
  });

  // 4.2. Reject high-risk referrals
  if (riskAssessment.status === "REJECTED") {
    throw new Error(riskAssessment.reason);
  }

  // 4.3. Determine referral status
  const referralStatus =
    riskAssessment.status === "FRAUD_REVIEW" ? "FRAUD_REVIEW" : "PENDING";

  // 5. Create the referral
  const referral = await Referral.create({
    referrerUserId: referrer._id,
    referredUserId: referredUser._id,
    referralCode: referrer.referralCode,
    attributionSource,
    status: referralStatus,
  });

  // 5.1. Create spam referral record for manual review
  if (riskAssessment.status === "FRAUD_REVIEW") {
    await SpamReferral.create({
      referralId: referral._id,
      referrerUserId: referrer._id,
      referredUserId: referredUser._id,
      reason: riskAssessment.reason,
      riskScore: riskAssessment.riskScore,
      status: "PENDING",
    });
  }

  // 6. Create progress tracking for the referral
  await ReferralProgress.create({
    referralId: referral._id,
    referredUserId: referredUser._id,
    eligibleAdsWatched: 0,
  });

  return referral;
};

const getReferralStats = async (userId) => {
  const referrals = await Referral.find({
    referrerUserId: userId,
  });

  const total = referrals.length;

  const successful = referrals.filter(
    (referral) => referral.status === "SUCCESSFUL",
  ).length;

  const pending = referrals.filter(
    (referral) => referral.status === "PENDING",
  ).length;

  const spam = referrals.filter(
    (referral) =>
      referral.status === "SPAM" || referral.status === "FRAUD_REVIEW",
  ).length;

  return {
    total,
    successful,
    pending,
    spam,
  };
};

const getMyReferralDashboard = async (userId) => {
  // 1. Find the authenticated user
  const user = await User.findById(userId).select("email referralCode");

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Find all referrals made by this user
  const referrals = await Referral.find({
    referrerUserId: userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  // 3. Calculate referral statistics
  const totalReferrals = referrals.length;

  const successfulReferrals = referrals.filter(
    (referral) => referral.status === "SUCCESSFUL",
  ).length;

  const pendingReferrals = referrals.filter(
    (referral) => referral.status === "PENDING",
  ).length;

  const spamReferrals = referrals.filter(
    (referral) =>
      referral.status === "SPAM" || referral.status === "FRAUD_REVIEW",
  ).length;

  // 4. Get reward totals from the reward ledger
  const rewardTotals = await RewardTransaction.aggregate([
    {
      $match: {
        userId: user._id,
        direction: "CREDIT",
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: "$rewardType",
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  // 5. Convert aggregation result into an easy-to-use object
  const totals = {
    SVE: 0,
    XP: 0,
    GEMS: 0,
    TOKENS: 0,
  };

  for (const reward of rewardTotals) {
    if (totals[reward._id] !== undefined) {
      totals[reward._id] = reward.total;
    }
  }

  // 6. Get progress for the user's referrals
  const referralProgress = await ReferralProgress.find({
    referralId: {
      $in: referrals.map((referral) => referral._id),
    },
  })
    .select("referralId referredUserId eligibleAdsWatched lastVerifiedAt")
    .lean();

  // 7. Create a quick lookup for progress
  const progressMap = new Map(
    referralProgress.map((progress) => [
      progress.referralId.toString(),
      progress,
    ]),
  );

  // 8. Add progress information to each referral
  const recentReferrals = referrals.map((referral) => {
    const progress = progressMap.get(referral._id.toString());

    return {
      referralId: referral._id,
      referredUserId: referral.referredUserId,
      status: referral.status,
      referralCode: referral.referralCode,
      attributionSource: referral.attributionSource,
      createdAt: referral.createdAt,
      completedAt: referral.completedAt || null,
      eligibleAdsWatched: progress?.eligibleAdsWatched || 0,
      lastVerifiedAt: progress?.lastVerifiedAt || null,
    };
  });

  // 9. Return dashboard data
  return {
    referralCode: user.referralCode,

    // Change this later if your production frontend uses another domain.
    referralLink: `/register?ref=${user.referralCode}`,

    totalReferrals,
    successfulReferrals,
    pendingReferrals,
    spamReferrals,

    totalSvesEarned: totals.SVE,
    totalXpEarned: totals.XP,
    totalGemsEarned: totals.GEMS,
    totalTokensEarned: totals.TOKENS,

    recentReferrals,
  };
};

const getReferralProgress = async (referralId, userId) => {
  // 1. Find the referral
  const referral = await Referral.findById(referralId).lean();

  if (!referral) {
    throw new Error("Referral not found");
  }

  // 2. Only the referrer can view this referral's progress
  if (referral.referrerUserId.toString() !== userId.toString()) {
    throw new Error("You are not authorized to view this referral");
  }

  // 3. Find referral progress
  const progress = await ReferralProgress.findOne({
    referralId: referral._id,
  }).lean();

  if (!progress) {
    throw new Error("Referral progress not found");
  }

  // 4. Get all active ad-based milestones
  const milestones = await RewardMilestone.find({
    isActive: true,
    requiredAds: {
      $ne: null,
    },
  })
    .sort({ requiredAds: 1 })
    .lean();

  // 5. Find rewards already issued for this referral
  const issuedRewards = await ReferralReward.find({
    referralId: referral._id,
  }).lean();

  const issuedMilestoneIds = new Set(
    issuedRewards.map((reward) => reward.milestoneId.toString()),
  );

  // 6. Determine milestone status
  const milestoneStatus = milestones.map((milestone) => {
    const reached = progress.eligibleAdsWatched >= milestone.requiredAds;

    const rewarded = issuedMilestoneIds.has(milestone._id.toString());

    return {
      milestoneId: milestone._id,
      name: milestone.name,
      requiredAds: milestone.requiredAds,
      rewardType: milestone.rewardType,
      rewardAmount: milestone.rewardAmount,
      reached,
      rewarded,
    };
  });

  // 7. Find next milestone
  const nextMilestone = milestoneStatus.find(
    (milestone) => !milestone.reached || !milestone.rewarded,
  );

  // 8. Calculate remaining ads
  const adsRemaining = nextMilestone
    ? Math.max(nextMilestone.requiredAds - progress.eligibleAdsWatched, 0)
    : 0;

  return {
    referralId: referral._id,
    status: referral.status,

    eligibleAdsWatched: progress.eligibleAdsWatched,

    lastVerifiedAt: progress.lastVerifiedAt || null,

    nextMilestone: nextMilestone || null,

    adsRemaining,

    milestones: milestoneStatus,
  };
};

const completeReferral = async (referralId, userId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Find the referral
    const referral = await Referral.findById(referralId).session(session);

    if (!referral) {
      throw new Error("Referral not found");
    }

    if (referral.referrerUserId.toString() !== userId.toString()) {
      throw new Error("You are not authorized to complete this referral");
    }

    // 2. Prevent completing the same referral twice
    if (referral.status === "SUCCESSFUL") {
      await session.commitTransaction();
      return referral;
    }

    // 3. Only a pending referral can become successful
    if (referral.status !== "PENDING") {
      throw new Error(
        `Referral cannot be completed from status ${referral.status}`,
      );
    }

    // 4. Find referral progress
    const progress = await ReferralProgress.findOne({
      referralId: referral._id,
    }).session(session);

    if (!progress) {
      throw new Error("Referral progress not found");
    }

    // 5. Successful referral requires the final 35-ad qualification
    if (progress.eligibleAdsWatched < 35) {
      throw new Error("Referral has not completed the required qualification");
    }

    // 6. Find the configured Successful Referral XP milestone
    const xpMilestone = await RewardMilestone.findOne({
      name: "Successful Referral XP",
      rewardType: "XP",
      rewardAmount: 20,
      isActive: true,
    }).session(session);

    if (!xpMilestone) {
      throw new Error("Successful Referral XP milestone not configured");
    }

    // 7. Prevent duplicate XP reward
    const existingReward = await ReferralReward.findOne({
      referralId: referral._id,
      milestoneId: xpMilestone._id,
    }).session(session);

    if (!existingReward) {
      // 8. Create referral reward
      const referralReward = new ReferralReward({
        referralId: referral._id,
        referrerUserId: referral.referrerUserId,
        milestoneId: xpMilestone._id,
        rewardType: xpMilestone.rewardType,
        rewardAmount: xpMilestone.rewardAmount,
        status: "CREDITED",
        creditedAt: new Date(),
      });

      await referralReward.save({ session });

      // 9. Create XP reward transaction
      const rewardTransaction = new RewardTransaction({
        userId: referral.referrerUserId,
        referralId: referral._id,
        referralRewardId: referralReward._id,
        rewardType: "XP",
        amount: 20,
        direction: "CREDIT",
        status: "COMPLETED",
        idempotencyKey: `${referral._id}-${xpMilestone._id}`,
        reason: "Successful Referral",
        processedAt: new Date(),
      });

      await rewardTransaction.save({ session });

      // 10. Update actual XP balance
      await User.updateOne(
        {
          _id: referral.referrerUserId,
        },
        {
          $inc: {
            "balances.xp": 20,
          },
        },
        {
          session,
        },
      );
    }

    // 11. Mark referral successful
    referral.status = "SUCCESSFUL";
    referral.completedAt = new Date();

    await referral.save({ session });

    // 12. Commit transaction
    await session.commitTransaction();

    return referral;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export {
  createReferral,
  getReferralStats,
  getMyReferralDashboard,
  getReferralProgress,
  completeReferral,
};
