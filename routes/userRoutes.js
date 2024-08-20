import express from "express";
import { signup, signin, updatePassword } from "../controllers/userController.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/updatePassword", updatePassword);

export default router;
