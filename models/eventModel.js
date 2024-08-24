import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: 'Event date must be in the future',
      },
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      validate: {
        validator: function (value) {
          // Basic validation for HH:MM format (24-hour clock)
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        },
        message: 'Invalid time format (HH:MM)',
      },
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    image: {
      type: String,
    },
    genre: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    link: {
      type: String,
    },
    duration: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
    },
    ageRestriction: {
      type: String,
      trim: true,
    },
    availableSeats: {
      type: Number,
      min: [0, 'Available seats cannot be negative'],
      required: [true, 'Available seats are required'],
    },
    ticketsSold: {
      type: Number,
      default: 0,
      min: [0, 'Tickets sold cannot be negative'],
    },
    performers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event creator is required'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative'],
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
