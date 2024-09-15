import express from "express";
import { createOrderId, verifyPayment } from "../controllers/paymentController.js";

const paymentrouter = express.Router();

paymentrouter.post("/create-order", createOrderId);
paymentrouter.post("/verify-payment", verifyPayment);

export default paymentrouter;
