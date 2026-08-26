import mongoose from "mongoose";
import AdEvent from "../models/AdEvent.js";
import ReferralProgress from "../models/ReferralProgress.js";
import Referral from "../models/Referral.js";
import { processReferralRewards } from "./reward.service.js";
import ApiError from "../utils/ApiError.js";
import { createAuditLog } from "./auditLog.service.js";

const recordAdEvent = async ({
  eventId,
  userId,
  eventType,
  occurredAt,
  verified,
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Prevent duplicate ad events
    const existingEvent = await AdEvent.findOne({
      eventId,
    }).session(session);

    if (existingEvent) {
      throw new ApiError(
        409,
        "Ad event already exists",
        "AD_EVENT_ALREADY_EXISTS",
      );
    }

    // 2. Find referral progress
    const progress = await ReferralProgress.findOne({
      referredUserId: userId,
    }).session(session);

    if (!progress) {
      throw new ApiError(
        404,
        "Referral progress not found",
        "REFERRAL_PROGRESS_NOT_FOUND",
      );
    }

    // 3. Find the referral
    const referral = await Referral.findById(
      progress.referralId,
    ).session(session);

    if (!referral) {
      throw new ApiError(
        404,
        "Referral not found",
        "REFERRAL_NOT_FOUND",
      );
    }

    // 4. Only pending referrals can accumulate ad progress
    if (referral.status !== "PENDING") {
      throw new ApiError(
        409,
        "Referral is not eligible for ad progress",
        "REFERRAL_NOT_ELIGIBLE",
      );
    }

    // 5. Create the ad event
    const [adEvent] = await AdEvent.create(
      [
        {
          eventId,
          userId,
          eventType,
          status: verified ? "VERIFIED" : "REJECTED",
          eligible: verified,
          occurredAt: occurredAt || new Date(),
        },
      ],
      { session },
    );

    // 6. Create audit log
    await createAuditLog({
      action: verified
        ? "AD_EVENT_VERIFIED"
        : "AD_EVENT_REJECTED",

      userId,

      adEventId: adEvent._id,

      referralId: referral._id,

      metadata: {
        eventId,
        eventType,
        verified,
      },

      session,
    });

    // 7. Only verified ads increase progress
    if (verified) {
      const updatedProgress =
        await ReferralProgress.findByIdAndUpdate(
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
            session,
          },
        );

      if (!updatedProgress) {
        throw new ApiError(
          404,
          "Referral progress not found",
          "REFERRAL_PROGRESS_NOT_FOUND",
        );
      }

      // 8. Process rewards
      await processReferralRewards(
        updatedProgress.referralId,
        session,
      );
    }

    // 9. Commit everything together
    await session.commitTransaction();

    return adEvent;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export { recordAdEvent };