import { cloudinary } from '../config/cloudinary.js';
import Promotion from '../models/promotionModel.js';
import { ApiError, ApiResponse } from '../utils/ApiResponses.js';
import moment from "moment";

export const createPromotion = async (req, res) => {
  try {
    const { eventId, startDate, expiry } = req.body;

    const start = moment(startDate, 'DD-MM-YYYY HH:mm:ss', true);
    const end = expiry ? moment(expiry, 'DD-MM-YYYY HH:mm:ss', true) : null;

    if (!start.isValid()) {
      return res.status(400).json({ message: 'Invalid startDate format' });
    }

    if (!end.isValid()) {
      return res.status(400).json({ message: 'Invalid expiry format' });
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
      $or: [
        { expiry: { $gte: today } }, // valid if expiry is after today
        { expiry: null }, // or if expiry is null
      ],
    }).populate('eventId'); // populate event details

    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving promotions', error });
  }
};
