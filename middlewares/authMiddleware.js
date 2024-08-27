import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiResponses.js";
import User from "../models/userModel.js";
import {unauthorizedRoutes} from "../utils/protectedRoutes.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const path = req.path;
    if (unauthorizedRoutes.includes(path)) {
      return next();
    } else {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json(new ApiError(401, "Unauthorized"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded.id;
      const user = User.findOne({ _id: userId });
      req.user = user;
      next();
    }
  } catch (error) {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }
};