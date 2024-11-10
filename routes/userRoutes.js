import express from "express";
import { signup, signin, getUserInfo } from "../controllers/userController.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/getUserById/:id", getUserInfo);

export default router;
