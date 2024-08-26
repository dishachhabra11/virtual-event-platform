import {organizerRoutes} from "../utils/protectedRoutes.js";
import { ApiError } from "../utils/ApiResponses.js";
export const organizerMiddleware = async (req, res, next) => {
  try {
    const path = req.path;
    if (organizerRoutes.includes(path)) {
      if (req.user.role == "organizer") next();
      else return res.status(401).json(new ApiError(401, "Unauthorized Access to organizer routes"));
    } else {
      return next();
    }
  } catch (error) {
    return res.status(401).json(new ApiError(401, error.message));
  }
};
