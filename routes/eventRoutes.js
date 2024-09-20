import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
  updateEvent,
  searchEvents,
  filter,
  getEventsGenreWithCount,
} from '../controllers/eventController.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

router.get('/', getAllEvents);
router.post('/', upload.single('image'), createEvent);
router.get('/filter', filter);
router.get('/searchEvents', searchEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/:id', getEventById);
router.get('/genre/count', getEventsGenreWithCount);

export default router;
