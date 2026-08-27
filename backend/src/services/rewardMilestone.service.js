import RewardMilestone from "../models/RewardMilestone.js";
import ApiError from "../utils/ApiError.js";

const getActiveRewardMilestones = async () => {
  const milestones = await RewardMilestone.find({
    isActive: true,
  }).sort({
    requiredAds: 1,
  });

  return milestones;
};

export { getActiveRewardMilestones };