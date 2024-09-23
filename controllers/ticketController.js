import Ticket from "../models/ticketModel.js";
import { ApiResponse, ApiError } from "../utils/ApiResponses.js";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";

export const createTicket = async (req, res) => {
  try {
    const { buyer, event, ticketType, price, seatNumber, status } = req.body;
    const newTicket = new Ticket({
      event,
      buyer,
      ticketType,
      price,
      seatNumber,
      status,
      payment,
    });
    await newTicket.save();

    return res.status(201).json(new ApiResponse(200, "ticket booked successfully", newTicket));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const createQR = async (req, res) => {
  try {
    const ticketId = req.body.ticketId;
    const ticket = await Ticket.findById(ticketId);

    const token = jwt.sign({ ticketId: ticket._id }, process.env.JWT_SECRET_KEY);

    const redirectUrl = `${process.env.CLIENT_URL}/verifyToken?token=${token}`;

    QRCode.toDataURL(redirectUrl, (err, url) => {
      if (err) {
        return res.status(500).json(new ApiError(500, err.message));
      }
      return res.status(200).json(new ApiResponse(200, "QR code generated successfully", { qrCode: url }));
    });
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const getQR = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json(new ApiError(404, "Ticket not found"));
    }
    return res.status(200).json(new ApiResponse(200, "Ticket found", ticket.qrCode));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const getTicketDetails = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json(new ApiError(404, "Ticket not found"));
    }
    return res.status(200).json(new ApiResponse(200, "Ticket found", ticket));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

//verify the ticket and provide information
//mark ticket as active or used

export const verifyTicket = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(400).json(new ApiError(400, "Invalid token"));
    }
    const ticketId = decoded.ticketId;
    const ticket = await Ticket.findById(ticketId);
    const status = ticket.status;
    //400 will show ticket expired or used
    if (status !== "active") {
      return res.status(400).json(new ApiError(400, "Ticket already used"));
    }
    return res.status(200).json(new ApiResponse(200, "Ticket verified successfully", ticket));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const useTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findByIdAndUpdate({ ticketId: ticketId }, { status: "used" });
    if (!ticket) {
      return res.status(404).json(new ApiError(404, "Ticket not found"));
    }
    return res.status(200).json(new ApiResponse(200, "Ticket used successfully", ticket));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
