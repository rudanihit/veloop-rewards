import { Router } from "express";
import { recordAdEventController } from "../controllers/adEvent.controller.js";
import authenticateUser from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/", recordAdEventController);

export default router;