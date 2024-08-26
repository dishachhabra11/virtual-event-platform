import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import Event from '../models/eventModel.js';

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const createEvent = async (req, res) => {
    try {
      const {
        title,
        description,
        date,
        time,
        location,
        genre,
        price,
        link,
        duration,
        language,
        ageRestriction,
        availableSeats,
        performers,
        creator,
        tags,
      } = req.body;
  
      let imageUrl;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'uploads',
        });
  
        fs.unlinkSync(req.file.path);
        imageUrl = result.secure_url;
      }
  
      const newEvent = new Event({
        title,
        description,
        date,
        time,
        location,
        genre,
        price,
        link,
        duration,
        language,
        ageRestriction,
        availableSeats,
        performers,
        creator,
        tags,
        image: imageUrl || '',
      });
  
      await newEvent.save();
  
      res.status(201).json({
        message: 'Event created successfully',
        data: newEvent,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to create event',
        error: error.message,
      });
    }
  };
