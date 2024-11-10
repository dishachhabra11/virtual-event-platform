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

    if (generatedSignature === razorpay_signature) {
      console.log("Signature verified successfully");

      const payment = await Payment.findOne({ transactionId: razorpay_order_id });
      if (!payment) {
        console.log("Payment record not found in the database");
        return res.status(400).json(new ApiError(400, "Payment record not found"));
      }

      const paymentId = payment._id;
      console.log("Creating ticket with event details:", eventDetails);

      let newTicket;
      try {
        newTicket = new Ticket({
          event: eventDetails._id,
          price: eventDetails.price,
          payment: paymentId,
        });
        await newTicket.save();
        console.log("Ticket saved successfully:", newTicket);
      } catch (error) {
        console.error("Error saving ticket:", error);
        return res.status(500).json(new ApiError(500, "Error saving ticket"));
      }

      try {
        const response = await axios.post(`${process.env.BACKEND_BASE_URL}/api/ticket/createQR`, {
          ticketId: newTicket._id,
        });
        newTicket.qrCode = response.data.response.qrCode;
        await newTicket.save();
        console.log("QR code generated and saved:", newTicket.qrCode);
      } catch (error) {
        console.error("Error generating QR code:", error);
        return res.status(500).json(new ApiError(500, "Error generating QR code"));
      }

      payment.paymentStatus = "completed";
      payment.paymentDate = Date.now();
      payment.ticket = newTicket._id;

      try {
        await payment.save();
        console.log("Payment record updated successfully:", payment);
      } catch (error) {
        console.error("Error updating payment:", error);
        return res.status(500).json(new ApiError(500, "Error updating payment"));
      }

      return res.status(200).json(new ApiResponse(200, "Payment verified and ticket created successfully"));
    } else {
      console.log("Signature mismatch - verification failed");
      return res.status(400).json(new ApiError(400, "Payment verification failed"));
    }
  } catch (error) {
    console.error("Verification process failed:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};
