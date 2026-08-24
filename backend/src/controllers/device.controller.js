import { registerDevice } from "../services/deviceRisk.service.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerDeviceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { deviceId } = req.body;

    if (!userId) {
      throw new Error("Authenticated user not found");
    }

    if (!deviceId) {
      throw new Error("deviceId is required");
    }

    const result = await registerDevice({
      userId,
      deviceId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Device registered successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

export {
  registerDeviceController,
};