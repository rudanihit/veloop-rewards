import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import healthRoutes from "./routes/health.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import referralRoutes from "./routes/referral.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adEventRoutes from "./routes/adEvent.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import rewardMilestoneRoutes from "./routes/rewardMilestone.route.js";

const app = express();

app.set("trust proxy", 1);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VELoop API is running",
  });
});

app.use(helmet());

const allowedOrigins = [
  "https://veloop-rewards-two.vercel.app",
  "https://veloop-rewards-git-main-single-person3.vercel.app",
  "https://veloop-rewards-ecrobgxlt-single-person3.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman or server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
  rewardMilestoneRoutes
);
app.use("/api/ad-events", adEventRoutes);
app.use("/api/devices", deviceRoutes);

app.use(errorHandler);

export default app;