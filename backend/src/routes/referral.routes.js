import { Router } from "express";

import {
  createReferralController,
  getMyReferralStats,
  completeReferralController,
  getMyReferralDashboardController,
  getReferralProgressController,
} from "../controllers/referral.controller.js";

import authenticateUser from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

// Create a new referral
router.post("/", createReferralController);

// Get referral dashboard
router.get("/me", getMyReferralDashboardController);

// Get referral statistics
router.get("/stats/:userId", getMyReferralStats);

// Get referral progress
router.get(
  "/:referralId/progress",
  getReferralProgressController
);

// Complete a successful referral
router.post(
  "/:referralId/complete",
  completeReferralController
);

export default router;