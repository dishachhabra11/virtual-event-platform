import express from "express";
import { createTicket,createQR } from "../controllers/ticketController.js";

const ticketRouter = express.Router();

ticketRouter.post("/createTicket", createTicket);
ticketRouter.post("/createQR", createQR);

export default ticketRouter;
