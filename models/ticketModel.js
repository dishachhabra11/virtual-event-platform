import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Associated event is required'],
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ticket buyer is required'],
    },
    ticketType: {
      type: String,
      enum: ['general', 'vip'],
      required: [true, 'Ticket type is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Price cannot be negative'],
    },
    seatNumber: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
      required: [true, 'Purchase date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled'],
      default: 'active',
      required: [true, 'Ticket status is required'],
    },
    qrCode: {
      type: String,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
