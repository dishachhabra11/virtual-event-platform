import express from "express";
import { createEvent, getAllEvents } from "../controllers/eventController.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/", getAllEvents);
router.post("/", upload.single("image"), createEvent);

export default router;
