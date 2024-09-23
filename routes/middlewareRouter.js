import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { organizerMiddleware } from "../middlewares/organizerMiddleware.js";
import { adminMiddleware } from "../middlewares/adminRoutes.js";
import { hostMiddleware } from "../middlewares/hostMiddleware.js";

const middlewareRouter = express.Router();

// middlewareRouter.use((req, res, next) => {
//   authMiddleware(req, res, next);
// });
// middlewareRouter.use((req, res, next) => {
//   organizerMiddleware(req, res, next);
// });
// middlewareRouter.use((req, res, next) => {
//  adminMiddleware(req, res, next);
// });
// middlewareRouter.use((req, res, next) => {
//   hostMiddleware(req, res, next);
// });

export default middlewareRouter;
