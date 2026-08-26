import { Router } from "express";
import rateLimit from "express-rate-limit";

import { recordAdEventController } from "../controllers/adEvent.controller.js";
import authenticateUser from "../middleware/auth.middleware.js";

const router = Router();

const adEventLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many ad events, please try again later",
  },
});

router.use(authenticateUser);

router.post("/", adEventLimiter, recordAdEventController);

export default router;