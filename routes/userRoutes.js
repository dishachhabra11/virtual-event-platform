import express from "express";
import { signup, signin, updatePassword, sendOtpforForgotPassword ,verifyOtp} from "../controllers/userController.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/updatePassword", updatePassword);
router.post("/sendOtpforForgotPassword", sendOtpforForgotPassword);
router.post("/verifyOtp", verifyOtp);

export default router;
