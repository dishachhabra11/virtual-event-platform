import { cloudinary } from '../config/cloudinary.js';
import Premiere from '../models/premiereModel.js';
import { ApiError, ApiResponse } from '../utils/ApiResponses.js';
import moment from 'moment';

export const createPremiere = async (req, res) => {
  try {
    const { name, date, location, description } = req.body;

    const d = moment(date, 'DD-MM-YYYY HH:mm:ss', true);

    let imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'uploads',
      });

      fs.unlinkSync(req.file.path);
      imageUrl = result.secure_url;
    }
    const newPremiere = new Premiere({
      name,
      date: d.toDate(),
      location,
      description,
      image,
    });
    await newPremiere.save();
    return res
      .status(201)
      .json(new ApiResponse(201, 'Premiere created successfully', newPremiere));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const getAllPremieres = async (req, res) => {
  try {
    const premieres = await Premiere.find().sort({ date: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, 'Premieres fetched successfully', premieres));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const deletePremiere = async (req, res) => {
  try {
    const { id } = req.params;
    const isDeleted = await Premiere.findByIdAndDelete(id);
    if (isDeleted) {
      return res
        .status(200)
        .json(new ApiResponse(200, 'Premiere deleted successfully'));
    } else {
      return res
        .status(500)
        .json(new ApiError(500, 'Failed to delete premiere'));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
