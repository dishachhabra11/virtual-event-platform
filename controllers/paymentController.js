import client from "../utils/razorpayClient.js";
import { ApiResponse, ApiError } from "../utils/ApiResponses.js";
import Payment from "../models/paymentModel.js";

export const createOrderId = async (req, res) => {
  try {
    const { amount, ticketId, buyerId } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
    };
    const response = await client.orders.create(options);
    console.log(response.receipt);
    const newPayment = new Payment({
      ticket: ticketId,
      buyer: buyerId,
      amount,
      paymentMethod: "credit_card",
      paymentStatus: "pending",
      transactionId: response.id,
    });
    newPayment.save();
    return res.status(200).json({
      response,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    //verify the signature geerate by razorpay with id and secret
    if (generatedSignature === razorpay_signature) {
      const payment = await Payment.findOneAndUpdate({ transactionId: razorpay_order_id }, { paymentStatus: "completed", paymentDate: Date.now() });

      return res.status(200).json(new ApiResponse(200, "Payment verified successfully", payment));
    } else {
      return res.status(400).json(new ApiError(400, "Payment verification failed"));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
