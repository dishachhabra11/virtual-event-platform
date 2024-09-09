import Ticket from "../models/ticketModel.js";
import { ApiResponse ,ApiError} from "../utils/ApiResponses.js";

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
      
      return res.status(201).json( new ApiResponse(200,"ticket booked successfully",newTicket))

  } catch (error) {
      return res.status(500).json(new ApiError(500, error.message));
  }
};
