import { Router } from "express";

import {
  getRewardMilestonesController,
} from "../controllers/rewardMilestone.controller.js";

import authenticateUser from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.get(
  "/",
  getRewardMilestonesController,
);

export default router;