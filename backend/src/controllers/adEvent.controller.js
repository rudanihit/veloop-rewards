import { recordAdEvent } from "../services/adEvent.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const recordAdEventController = async (req, res, next) => {
  try {
    const { eventId, eventType, occurredAt, devVerified } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Authenticated user not found", "UNAUTHORIZED");
    }

    if (!eventId) {
      throw new ApiError(400, "eventId is required", "INVALID_REQUEST");
    }

    const allowedEventTypes = ["VIDEO_AD_COMPLETED"];

    if (!eventType) {
      throw new ApiError(400, "eventType is required", "INVALID_REQUEST");
    }

    if (!allowedEventTypes.includes(eventType)) {
      throw new ApiError(400, "Invalid eventType", "INVALID_REQUEST");
    }

    if (occurredAt !== undefined) {
      const occurredDate = new Date(occurredAt);

      if (Number.isNaN(occurredDate.getTime())) {
        throw new ApiError(400, "Invalid occurredAt", "INVALID_REQUEST");
      }

      const now = Date.now();
      const occurredTime = occurredDate.getTime();

      const maxFutureTime = now + 5 * 60 * 1000;
      const maxPastTime = now - 24 * 60 * 60 * 1000;

      if (occurredTime > maxFutureTime) {
        throw new ApiError(
          400,
          "occurredAt cannot be more than 5 minutes in the future",
          "INVALID_REQUEST",
        );
      }

      if (occurredTime < maxPastTime) {
        throw new ApiError(
          400,
          "occurredAt cannot be older than 24 hours",
          "INVALID_REQUEST",
        );
      }
    }

    const adEvent = await recordAdEvent({
      eventId,
      userId,
      eventType,
      occurredAt,
      verified: devVerified === true,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, adEvent, "Ad event recorded successfully"));
  } catch (error) {
    next(error);
  }
};

export { recordAdEventController };
