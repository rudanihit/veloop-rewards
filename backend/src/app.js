import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import referralRoutes from "./routes/referral.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adEventRoutes from "./routes/adEvent.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import rateLimit from "express-rate-limit";
import rewardMilestoneRoutes from "./routes/rewardMilestone.route.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests, please try again later",
  },
});

app.use("/api/", apiLimiter);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/referrals", referralRoutes);
app.use(
  "/api/rewards/milestones",
  rewardMilestoneRoutes,
);
app.use("/api/ad-events", adEventRoutes);
app.use("/api/devices", deviceRoutes);
app.use(errorHandler);

export default app;