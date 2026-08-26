import { registerDevice } from "../services/deviceRisk.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const registerDeviceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { deviceId } = req.body;

    if (!userId) {
      throw new ApiError(401, "Authenticated user not found");
    }

    if (!deviceId) {
      throw new ApiError(400, "deviceId is required");
    }

    const result = await registerDevice({
      userId,
      deviceId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Device registered successfully"));
  } catch (error) {
    next(error);
  }
};

export { registerDeviceController };
