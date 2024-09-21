import mongoose from 'mongoose';

const premiereSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Premiere = mongoose.model('Premiere', premiereSchema);

export default Premiere;