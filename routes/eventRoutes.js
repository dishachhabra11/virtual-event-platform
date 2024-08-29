import express from "express";
import { createEvent, getAllEvents, getEventById, deleteEvent, updateEvent, filterEventsByCity, getUpcomingEvents, getPastEvents, filterByGenre, filterByPrice,searchEvents} from "../controllers/eventController.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/", getAllEvents);
router.post("/", upload.single("image"), createEvent);
router.get("/searchByCity", filterEventsByCity);
router.get("/upcomingEvents", getUpcomingEvents);
router.get("/pastEvents", getPastEvents);
router.get("/filterByGenre", filterByGenre);
router.get("/filterByPrice", filterByPrice);
router.get("/searchEvents", searchEvents);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.get("/:id", getEventById);

export default router;
