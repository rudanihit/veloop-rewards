import { Router } from "express";
import { devLogin } from "../controllers/auth.controller.js";

const router = Router();

router.post("/dev-login", devLogin);

export default router;