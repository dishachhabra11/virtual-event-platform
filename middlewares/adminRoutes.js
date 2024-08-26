import { adminRoutes} from "../utils/protectedRoutes.js";
import { ApiError } from "../utils/ApiResponses.js";
export const adminMiddleware = async (req, res, next) => {
  try {
    const path = req.path;
    if (adminRoutes.includes(path)) {
      if (req.user.role == "admin") next();
      else return res.status(401).json(new ApiError(401, "Unauthorized Access to admin routes"));
    } else {
      return next();
    }
  } catch (error) {
    return res.status(401).json(new ApiError(401, error.message));
  }
};
