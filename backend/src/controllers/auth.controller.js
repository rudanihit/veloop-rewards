import { generateDevToken } from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const devLogin = async (req, res, next) => {
  try {
    // Development login must never be available in production
    if (process.env.NODE_ENV === "production") {
      throw new ApiError(
        403,
        "Development login is disabled in production",
        "DEV_LOGIN_DISABLED",
      );
    }

    const { email } = req.body;

    const result = await generateDevToken(email);

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Development login successful",
      ),
    );
  } catch (error) {
    next(error);
  }
};

export {
  devLogin,
};