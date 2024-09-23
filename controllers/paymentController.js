import client from "../utils/razorpayClient.js";
import { ApiResponse, ApiError } from "../utils/ApiResponses.js";
import Payment from "../models/paymentModel.js";
import crypto from "crypto";
import Ticket from "../models/ticketModel.js";
import axios from "axios";

export const createOrderId = async (req, res) => {
  try {
    const { amount, buyerId } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
    };
    const response = await client.orders.create(options);
    console.log(response.receipt);
    const newPayment = new Payment({
      buyer: buyerId,
      amount: amount,
      paymentMethod: "credit_card",
      paymentStatus: "pending",
      transactionId: response.id,
    });
    await newPayment.save();
    // console.log("newPayment", newPayment);
    return res.status(200).json({
      newPayment,
      response,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventDetails } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    //verify the signature geerate by razorpay with id and secret
    if (generatedSignature === razorpay_signature) {
      const payment = await Payment.findOne({ transactionId: razorpay_order_id });
      if (!payment) {
        return res.status(400).json(new ApiError(400, "Payment jhatu failed"));
      }
      const paymentId = payment._id;

      const newTicket = new Ticket({
        buyer: eventDetails.buyer,
        event: eventDetails.event,
        ticketType: eventDetails.ticketType,
        price: eventDetails.price,
        seatNumber: eventDetails.seatNumber,
        payment: paymentId, // Link to the payment/order ID
      });
      await newTicket.save();

      try {
        const response = await axios.post("http://localhost:5000/api/ticket/createQR", {
          ticketId: newTicket._id,
        });
        console.log(response.data.response.qrCode);
        newTicket.qrCode = response.data.response.qrCode; // Adjust based on actual response structure
        await newTicket.save();
      } catch (error) {
        console.error("Error generating QR code:", error);
        return res.status(500).json(new ApiError(500, "Error generating QR code"));
      }

      payment.paymentStatus = "completed";
      payment.paymentDate = Date.now();
      payment.ticket = newTicket._id;

      await payment.save();

      return res.status(200).json(new ApiResponse(200, "Payment verified successfully"));
    } else {
      return res.status(400).json(new ApiError(400, "Payment verification failed"));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
