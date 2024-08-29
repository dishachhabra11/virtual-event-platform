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

export const filterEventsByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) return res.status(400).json(new ApiError(400, "City is required"));
    const filteredEvents = await Event.aggregate([
      {
        $match: {
          city: city,
        },
      },
    ]);
    return res.status(200).json(new ApiResponse(200, "Events fetched successfully", filteredEvents));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const date = new Date();
    const upcomingEvents = await Event.aggregate([
      {
        $match: {
          date: {
            $gte: date,
          },
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);
    return res.status(200).json(new ApiResponse(200, "Upcoming events fetched successfully", upcomingEvents));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const getPastEvents = async (req, res) => {
  try {
    const date = new Date();
    const upcomingEvents = await Event.aggregate([
      {
        $match: {
          date: {
            $lte: date,
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]);
    return res.status(200).json(new ApiResponse(200, "Past events fetched successfully", upcomingEvents));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const filterByGenre = async (req, res) => {
  try {
    const { genre } = req.query;
    genre = genre.toLowerCase();
    if (!genre) return res.status(400).json(new ApiError(400, "Genre is required"));

    const filteredEvents = await Event.aggregate([
      {
        $facet: {
          data: [
            {
              $match: {
                genre: genre,
              },
            },
            {
              $sort: {
                date: 1,
              },
            },
          ],
          count: [
            {
              $match: {
                genre: genre,
              },
            },
            {
              $count: "count",
            },
          ],
        },
      },
    ]);
    return res.status(200).json(new ApiResponse(200, "Events fetched successfully", filteredEvents));
  } catch (error) {}
};

export const filterByPrice = async (req, res) => {
  try {
    const lowestPrice = req.query.low;
    const highestPrice = req.query.high;
    if (!lowestPrice || !highestPrice) return res.status(400).json(new ApiError(400, "Price range is required"));

    const filteredEvents = await Event.aggregate([
      {
        $facet: {
          data: [
            {
              $match: {
                price: {
                  $gte: parseFloat(lowestPrice),
                  $lte: parseFloat(highestPrice),
                },
              },
            },
          ],
          count: [
            {
              $match: {
                price: {
                  $gte: parseFloat(lowestPrice),
                  $lte: parseFloat(highestPrice),
                },
              },
            },
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    return res.status(200).json(new ApiResponse(200, "Events fetched successfully", filteredEvents));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
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
