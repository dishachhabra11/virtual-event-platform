import { cloudinary } from "../config/cloudinary.js";
import fs from "fs";
import Event from "../models/eventModel.js";
import { ApiError, ApiResponse } from "../utils/ApiResponses.js";

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
    const { title, description, date, time, location, genre, price, link, duration, language, ageRestriction, availableSeats, performers, creator, tags } = req.body;

    let imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
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
      image: imageUrl || "",
    });

    await newEvent.save();

    res.status(201).json({
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create event",
      error: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  /// get id from req.params
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    res.status(200).json(new ApiResponse(200, "Event fetched successfully", event));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Event id is required"));
    }
    const { title, description, date, time, location, genre, price, link, duration, language, ageRestriction, availableSeats, performers, creator, tags } = req.body;

    const newEvent = await Event.findOneAndUpdate(
      { _id: id },
      {
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
      },
      { new: true }
    );

    if (newEvent === null) {
      return res.status(404).json(new ApiError(404, "Event not found"));
    }
    return res.status(200).json(new ApiResponse(200, "Event updated successfully", newEvent));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const isDeleted = await Event.findByIdAndDelete(id);
    console.log(isDeleted);
    if (isDeleted) {
      return res.status(200).json(new ApiResponse(200, "Event deleted successfully"));
    } else {
      return res.status(500).json(new ApiError(500, "Failed to delete event"));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
