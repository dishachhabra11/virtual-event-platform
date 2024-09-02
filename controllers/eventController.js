import { cloudinary } from "../config/cloudinary.js";
import fs from "fs";
import Event from "../models/eventModel.js";
import { ApiError, ApiResponse } from "../utils/ApiResponses.js";

export const getAllEvents = async (req, res) => {
  try {
    let events = [];
    const { pastEvent } = req.query;

    if (pastEvent) {
      events = await Event.find({
        date: {
          $lt: new Date(),
        },
      }).sort({ date: -1 });
    } else {
      events = await Event.find({
        date: {
          $gte: new Date(),
        },
      }).sort({ date: 1 });
    }
    res.status(200).json(new ApiResponse(200, "Events fetched successfully", events));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, genre, price, link, duration, language, ageRestriction, availableSeats, performers, creator, tags, city } = req.body;

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
      city,
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
    const { title, description, date, time, location, genre, price, link, duration, language, ageRestriction, availableSeats, performers, creator, tags, city } = req.body;

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
        city,
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

export const filter = async (req, res) => {
  try {
    const { city, genre, minPrice, maxPrice, search } = req.query;
    const filters = {
      city: city,
      genre: genre,
      minPrice: minPrice,
      maxPrice: maxPrice,
    };
    const aggregationPipeline = [];
    const matchConditions = {};

    if (filters.city) {
      matchConditions.city = filters.city;
    }
    if (filters.genre) {
      matchConditions.genre = filters.genre;
    }
    if (filters.minPrice && filters.maxPrice) {
      matchConditions.price = {
        $gte: parseFloat(filters.minPrice),
        $lte: parseFloat(filters.maxPrice),
      };
    }
    aggregationPipeline.push({
      $match: matchConditions,
    });

    const events = await Event.aggregate(aggregationPipeline);
    return res.status(200).json(new ApiResponse(200, "Events fetched successfully", events));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};



export const searchEvents = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) return res.status(400).json(new ApiError(400, "Search query is required"));
    const filteredEvents = await Event.aggregate([
      {
        $match: {
          $or: [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }, { location: { $regex: search, $options: "i" } }, { genre: { $regex: search, $options: "i" } }, { city: { $regex: search, $options: "i" } }],
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: 50,
      },
    ]);

    return res.status(200).json(new ApiResponse(200, "Events fetched successfully", filteredEvents));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
