import { Router } from "express";
import ApiError from "../utils/ApiError.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VELoop API is working",
  });
});

export default router;