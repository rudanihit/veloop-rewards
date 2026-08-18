import { generateDevToken } from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";

const devLogin = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await generateDevToken(email);

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Development login successful"
      )
    );
  } catch (error) {
    next(error);
  }
};

export {
  devLogin,
};