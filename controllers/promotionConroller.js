import { cloudinary } from '../config/cloudinary.js';
import Promotion from '../models/promotionModel.js';
import { ApiError, ApiResponse } from '../utils/ApiResponses.js';
import moment from 'moment';
import fs from 'fs';
import Event from '../models/eventModel.js';

export const createPromotion = async (req, res) => {
  try {
    const { eventId, startDate, expiry } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json(new ApiError(404, 'Event not found'));
    }

    const existingPromotion = await Promotion.findOne({ eventId });
    if (existingPromotion) {
      return res
        .status(400)
        .json(new ApiError(400, 'Promotion already exists for this event'));
    }

    const start = moment(startDate, 'DD-MM-YYYY HH:mm:ss', true);
    const end = expiry ? moment(expiry, 'DD-MM-YYYY HH:mm:ss', true) : null;

    if (!start.isValid()) {
      return res
        .status(400)
        .json(new ApiError(400, 'Invalid start date format'));
    }

    if (!end.isValid()) {
      return res.status(400).json(new ApiError(400, 'Invalid end date format'));
    }

    let imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'uploads',
      });

      fs.unlinkSync(req.file.path);
      imageUrl = result.secure_url;
    }

    const newPromotion = new Promotion({
      eventId,
      startDate: start.toDate(),
      expiry: end ? end.toDate() : null,
      image: imageUrl,
    });
    await newPromotion.save();
    return res
      .status(500)
      .json(
        new ApiResponse(201, 'Promotion Created Successfully', newPromotion)
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(500, error.message || 'Error while creating Promotion')
      );
  }
};

export const getValidPromotionsForToday = async (req, res) => {
  try {
    const today = new Date();

    // Find promotions where startDate <= today and (expiry is null or expiry >= today)
    const promotions = await Promotion.find({
      startDate: { $lte: today },
      $or: [{ expiry: { $gte: today } }, { expiry: null }],
    });

    res.status(200).json(new ApiResponse(200, 'Promotions fetched successfully', promotions));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};
