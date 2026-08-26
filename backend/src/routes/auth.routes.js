import { Router } from "express";
import rateLimit from "express-rate-limit";

import { devLogin } from "../controllers/auth.controller.js";

const router = Router();

const devLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many development login attempts, please try again later",
  },
});

if (process.env.NODE_ENV !== "production") {
  router.post("/dev-login", devLoginLimiter, devLogin);
}

export default router;