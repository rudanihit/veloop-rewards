import {
  createReferral,
  getReferralStats,
  completeReferral,
  getMyReferralDashboard,
  getReferralProgress,
} from "../services/referral.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const createReferralController = async (req, res, next) => {
  try {
    const { referredUserId, referralCode, attributionSource, deviceId } =
      req.body;

    const referrerUserId = req.user?.id;

    if (!referrerUserId) {
      throw new ApiError(
        401,
        "Authenticated user not found",
        "UNAUTHORIZED",
      );
    }

    if (!referredUserId) {
      throw new ApiError(
        400,
        "referredUserId is required",
        "INVALID_REQUEST",
      );
    }

    if (!referralCode) {
      throw new ApiError(
        400,
        "referralCode is required",
        "INVALID_REQUEST",
      );
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
      .json(
        new ApiResponse(
          201,
          referral,
          "Referral created successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

const getMyReferralStats = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(
        401,
        "Authenticated user not found",
        "UNAUTHORIZED",
      );
    }

    const stats = await getReferralStats(userId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Referral statistics fetched successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

const getMyReferralDashboardController = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(
        401,
        "Authenticated user not found",
        "UNAUTHORIZED",
      );
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
      throw new ApiError(
        401,
        "Authenticated user not found",
        "UNAUTHORIZED",
      );
    }

    if (!referralId) {
      throw new ApiError(
        400,
        "referralId is required",
        "INVALID_REQUEST",
      );
    }

    const progress = await getReferralProgress(
      referralId,
      userId,
    );

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
      throw new ApiError(
        401,
        "Authenticated user not found",
        "UNAUTHORIZED",
      );
    }

    if (!referralId) {
      throw new ApiError(
        400,
        "referralId is required",
        "INVALID_REQUEST",
      );
    }

    const referral = await completeReferral(
      referralId,
      userId,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          referral,
          "Referral completed successfully",
        ),
      );
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