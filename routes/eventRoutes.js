import express from "express";
import { createEvent, getAllEvents, getEventById, deleteEvent, updateEvent } from "../controllers/eventController.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/", getAllEvents);
router.post("/", upload.single("image"), createEvent);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
