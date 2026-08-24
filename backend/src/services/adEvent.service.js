import AdEvent from "../models/AdEvent.js";
import ReferralProgress from "../models/ReferralProgress.js";
import Referral from "../models/Referral.js";
import { processReferralRewards } from "./reward.service.js";

const recordAdEvent = async ({
  eventId,
  userId,
  eventType,
  eligible,
  occurredAt,
}) => {
  // Prevent the same ad event from being recorded twice
  const existingEvent = await AdEvent.findOne({ eventId });

  if (existingEvent) {
    throw new Error("Ad event already exists");
  }

  // Find the referral progress belonging to this user
  const progress = await ReferralProgress.findOne({
    referredUserId: userId,
  });

  if (!progress) {
    throw new Error("Referral progress not found");
  }

  // Find the referral associated with this progress
const referral = await Referral.findById(progress.referralId);

if (!referral) {
  throw new Error("Referral not found");
}

// Only pending referrals can accumulate eligible ad progress
if (referral.status !== "PENDING") {
  throw new Error("Referral is not eligible for ad progress");
}

  // Create the ad event
  const adEvent = await AdEvent.create({
    eventId,
    userId,
    eventType,
    status: eligible ? "VERIFIED" : "REJECTED",
    eligible,
    occurredAt: occurredAt || new Date(),
  });

  // Only eligible ads increase referral progress
 if (eligible) {
  const updatedProgress = await ReferralProgress.findByIdAndUpdate(
    progress._id,
    {
      $inc: {
        eligibleAdsWatched: 1,
      },
      $set: {
        lastVerifiedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );

  await processReferralRewards(updatedProgress.referralId);
}

  return adEvent;
};

export {
  recordAdEvent,
};