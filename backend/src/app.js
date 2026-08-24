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

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/ad-events", adEventRoutes);
app.use("/api/devices", deviceRoutes);
app.use(errorHandler);

export default app;