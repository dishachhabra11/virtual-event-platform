import { cloudinary } from "../config/cloudinary.js";
import fs from "fs";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
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
    if (!event) {
      return res.status(404).json(new ApiError(404, "Event not found"));
    }
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
    const { city, genre, minPrice, maxPrice, date, performer } = req.query;

    // Parse filters from query
    const filters = {
      city,
      genre,
      minPrice: parseFloat(minPrice), // Convert to float
      maxPrice: parseFloat(maxPrice), // Convert to float
      date: date ? new Date(date) : null,
      performer,
    };

    const aggregationPipeline = [];
    const matchConditions = {};

    matchConditions.date = { $gte: new Date() };

    // Add filters to matchConditions
    if (filters.city) {
      matchConditions.city = filters.city;
    }

    if (filters.genre) {
      matchConditions.genre = filters.genre;
    }

    if (!isNaN(filters.minPrice) && !isNaN(filters.maxPrice)) {
      matchConditions.price = {
        $gte: filters.minPrice,
        $lte: filters.maxPrice,
      };
    } else if (!isNaN(filters.minPrice)) {
      matchConditions.price = { $gte: filters.minPrice };
    } else if (!isNaN(filters.maxPrice)) {
      matchConditions.price = { $lte: filters.maxPrice };
    }

    if (filters.date) {
      matchConditions.date = filters.date;
    }

    // Add $lookup to join performers from the User collection
    aggregationPipeline.push({
      $lookup: {
        from: "users", // MongoDB will use lowercase and pluralize the collection name
        localField: "performers",
        foreignField: "_id",
        as: "performerDetails",
      },
    });

    // Add the match conditions for city, genre, price, date
    aggregationPipeline.push({
      $match: matchConditions,
    });

    // Add a condition to match performer name using a case-insensitive regex
    if (filters.performer) {
      aggregationPipeline.push({
        $match: {
          "performerDetails.name": { $regex: filters.performer, $options: "i" }, // 'i' for case-insensitive
        },
      });
    }

    const events = await Event.aggregate(aggregationPipeline);

    return res.status(200).json({
      status: 200,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
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

export const getEventsGenreWithCount = async (req, res) => {
  try {
    const events = await Event.aggregate([
      {
        $group: {
          _id: "$genre",
          count: { $sum: 1 },
        },
      },
    ]);
    return res.status(200).json(new ApiResponse(200, "Events fetched successfully", events));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const incrementEventLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Assuming userId is sent in the request body

    if (!userId) {
      return res.status(400).json(new ApiError(400, "Invalid user ID"));
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json(new ApiError(404, "Event not found"));
    }

    event.likes = event.likes || [];
    event.dislikes = event.dislikes || [];

    event.likes = event.likes.filter((likeId) => likeId);
    event.dislikes = event.dislikes.filter((dislikeId) => dislikeId);

    if (!event.likes.includes(userId)) {
      event.likes.push(userId);

      event.dislikes = event.dislikes.filter((dislikeId) => dislikeId.toString() !== userId);
    } else {
      event.likes = event.likes.filter((likeId) => likeId.toString() !== userId);
    }

    await event.save({ validateModifiedOnly: true });
    console.log("liked");
    return res.status(200).json(new ApiResponse(200, "Event likes updated successfully", event));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const incrementEventDislikes = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json(new ApiError(404, "Event not found"));
    }
    event.likes = event.likes || [];
    event.dislikes = event.dislikes || [];

    if (!event.dislikes.includes(userId)) {
      event.dislikes.push(userId);

      event.likes = event.likes.filter((likeId) => likeId.toString() !== userId);
    } else {
      event.dislikes = event.dislikes.filter((dislikeId) => dislikeId.toString() !== userId);
    }

    await event.save({ validateModifiedOnly: true });

    return res.status(200).json(new ApiResponse(200, "Event dislikes updated successfully", event));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const trendingEvents = async (req, res) => {
  try {
    const events = await Event.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(),
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          image: 1,
          language: 1,
          likes: 1,
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      {
        $sort: { likesCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return res.status(200).json(new ApiResponse(200, "Trending events fetched successfully", events));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
