import { Router } from "express";

import {
  registerDeviceController,
} from "../controllers/device.controller.js";

import authenticateUser from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/register", registerDeviceController);

export default router;