import { hostRoutes } from "../utils/protectedRoutes.js";
import { ApiError } from "../utils/ApiResponses.js";
export const hostMiddleware = async (req, res, next) => {
  try {
    const path = req.path;
    if (hostRoutes.includes(path)) {
      if (req.user.role == "host") next();
      else return res.status(401).json(new ApiError(401, "Unauthorized Access to host routes"));
    } else {
      return next();
    }
  } catch (error) {
    return res.status(401).json(new ApiError(401, error.message));
  }
};
