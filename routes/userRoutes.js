import express from "express";
import { signup, signin, updatePassword,sendOtpforPasswordReset } from "../controllers/userController.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/updatePassword", updatePassword);
router.post("/sendOtpforPasswordReset", sendOtpforPasswordReset);

export default router;
