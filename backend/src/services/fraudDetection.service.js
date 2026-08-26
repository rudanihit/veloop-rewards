import User from "../models/User.js";
import Referral from "../models/Referral.js";
import UserDevice from "../models/UserDevice.js";
import { hashDeviceId } from "./deviceRisk.service.js";
import ApiError from "../utils/ApiError.js";

const assessReferralRisk = async ({
  referrerUserId,
  referredUserId,
  deviceId,
}) => {
  const riskSignals = [];
  let riskScore = 0;

  // 1. Direct self-referral
  if (referrerUserId.toString() === referredUserId.toString()) {
    return {
      riskScore: 100,
      status: "REJECTED",
      reason: "SELF_REFERRAL_DETECTED",
      signals: ["SELF_REFERRAL"],
    };
  }

  // 2. Load both users
  const [referrer, referredUser] = await Promise.all([
    User.findById(referrerUserId).lean(),
    User.findById(referredUserId).lean(),
  ]);

  if (!referrer || !referredUser) {
    throw new ApiError(404, "User not found during fraud assessment");
  }

  // 3. Email relationship signal
  if (
    referrer.email &&
    referredUser.email &&
    referrer.email.toLowerCase() === referredUser.email.toLowerCase()
  ) {
    riskScore += 50;
    riskSignals.push("MATCHING_EMAIL");
  }

  // 4. Phone relationship signal
  if (
    referrer.phone &&
    referredUser.phone &&
    referrer.phone === referredUser.phone
  ) {
    riskScore += 40;
    riskSignals.push("MATCHING_PHONE");
  }

  // 5. Existing referral history
  const previousReferral = await Referral.findOne({
    $or: [
      {
        referrerUserId: referredUserId,
      },
      {
        referredUserId: referrerUserId,
      },
    ],
  }).lean();

  if (previousReferral) {
    riskScore += 20;
    riskSignals.push("RELATED_REFERRAL_HISTORY");
  }

  // 6. Device association signal
  if (deviceId) {
    const deviceIdHash = hashDeviceId(deviceId);

    const device = await UserDevice.findOne({
      deviceIdHash,
    }).lean();

    if (
      device &&
      device.userId.toString() !== referrerUserId.toString() &&
      device.userId.toString() !== referredUserId.toString()
    ) {
      riskScore += 40;
      riskSignals.push("DEVICE_ASSOCIATED_WITH_ANOTHER_USER");
    }
  }

  // Keep the score within 0–100
  riskScore = Math.min(riskScore, 100);

  // Determine the result
  let status = "LOW_RISK";

  if (riskScore >= 80) {
    status = "REJECTED";
  } else if (riskScore >= 40) {
    status = "FRAUD_REVIEW";
  }

  return {
    riskScore,
    status,
    reason:
      riskSignals.length > 0 ? riskSignals.join(", ") : "NO_SUSPICIOUS_SIGNALS",
    signals: riskSignals,
  };
};

export { assessReferralRisk };
