import {
  getActiveRewardMilestones,
} from "../services/rewardMilestone.service.js";

import ApiResponse from "../utils/ApiResponse.js";

const getRewardMilestonesController = async (
  req,
  res,
  next,
) => {
  try {
    const milestones =
      await getActiveRewardMilestones();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          milestones,
          "Reward milestones fetched successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

export {
  getRewardMilestonesController,
};