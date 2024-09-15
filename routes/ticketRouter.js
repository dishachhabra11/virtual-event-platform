import express from "express";
import { createTicket } from "../controllers/ticketController.js";

const ticketRouter = express.Router();

ticketRouter.post("/createTicket", createTicket);

export default ticketRouter;
