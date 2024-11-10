import express from "express";
import { createEvent, getAllEvents, getEventById, deleteEvent, updateEvent, searchEvents, filter, getEventsGenreWithCount, incrementEventLikes, incrementEventDislikes, trendingEvents } from "../controllers/eventController.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/", getAllEvents);
router.post("/", upload.single("image"), createEvent);
router.get("/filter", filter);
router.get("/searchEvents", searchEvents);
router.get("/trending", trendingEvents);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.get("/:id", getEventById);
router.get("/genre/count", getEventsGenreWithCount);
router.post("/incrementLikes/:id", incrementEventLikes);
router.post("/incrementDislikes/:id", incrementEventDislikes);


export default router;
