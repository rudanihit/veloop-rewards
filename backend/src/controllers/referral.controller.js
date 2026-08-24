import {
  createReferral,
  getReferralStats,
  completeReferral,
  getMyReferralDashboard,
  getReferralProgress,
} from "../services/referral.service.js";

import ApiResponse from "../utils/ApiResponse.js";

const createReferralController = async (req, res, next) => {
  try {
    const { referredUserId, referralCode, attributionSource, deviceId, } =
      req.body;
    const referrerUserId = req.user?.id;

    if (!referrerUserId) {
      throw new Error("Authenticated user not found");
    }

    if (!referredUserId) {
      throw new Error("referredUserId is required");
    }

    if (!referralCode) {
      throw new Error("referralCode is required");
    }

    const referral = await createReferral({
      referrerUserId,
      referredUserId,
      referralCode,
      attributionSource,
      deviceId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, referral, "Referral created successfully"));
  } catch (error) {
    next(error);
  }
};

const getMyReferralStats = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const stats = await getReferralStats(userId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Referral statistics fetched successfully"),
      );
  } catch (error) {
    next(error);
  }
};

const getMyReferralDashboardController = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Authenticated user not found");
    }

    const dashboard = await getMyReferralDashboard(userId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          dashboard,
          "Referral dashboard fetched successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

const getReferralProgressController = async (req, res, next) => {
  try {
    const { referralId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Authenticated user not found");
    }

    if (!referralId) {
      throw new Error("referralId is required");
    }

    const progress = await getReferralProgress(referralId, userId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          progress,
          "Referral progress fetched successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

const completeReferralController = async (req, res, next) => {
  try {
    const { referralId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Authenticated user not found");
    }

    if (!referralId) {
      throw new Error("referralId is required");
    }

    const referral = await completeReferral(referralId, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, referral, "Referral completed successfully"));
  } catch (error) {
    next(error);
  }
};

export {
  createReferralController,
  getMyReferralStats,
  completeReferralController,
  getMyReferralDashboardController,
  getReferralProgressController,
};
