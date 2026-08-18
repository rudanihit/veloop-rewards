import { recordAdEvent } from "../services/adEvent.service.js";
import ApiResponse from "../utils/ApiResponse.js";

const recordAdEventController = async (req, res, next) => {
  try {
    const { eventId, eventType, eligible, occurredAt } = req.body;

    const userId = req.user?.id;

    if (!eventId) {
      throw new Error("eventId is required");
    }

    const allowedEventTypes = ["VIDEO_AD_COMPLETED"];

    if (!eventType) {
      throw new Error("eventType is required");
    }

    if (!allowedEventTypes.includes(eventType)) {
      throw new Error("Invalid eventType");
    }

    if (typeof eligible !== "boolean") {
      throw new Error("eligible must be a boolean");
    }

    if (occurredAt !== undefined) {
      const occurredDate = new Date(occurredAt);

      if (Number.isNaN(occurredDate.getTime())) {
        throw new Error("Invalid occurredAt");
      }

      const now = Date.now();
      const occurredTime = occurredDate.getTime();

      const maxFutureTime = now + 5 * 60 * 1000;
      const maxPastTime = now - 24 * 60 * 60 * 1000;

      if (occurredTime > maxFutureTime) {
        throw new Error(
          "occurredAt cannot be more than 5 minutes in the future",
        );
      }

      if (occurredTime < maxPastTime) {
        throw new Error("occurredAt cannot be older than 24 hours");
      }
    }

    const adEvent = await recordAdEvent({
      eventId,
      userId,
      eventType,
      eligible,
      occurredAt,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, adEvent, "Ad event recorded successfully"));
  } catch (error) {
    next(error);
  }
};

export { recordAdEventController };
