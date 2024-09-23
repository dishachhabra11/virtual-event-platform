import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    startDate:{
      type: Date,
      required: true,
    },
    expiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;
