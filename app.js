import express from "express";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import middlewareRouter from "./routes/middlewareRouter.js";
import eventRouter from "./routes/eventRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import ticketRouter from "./routes/ticketRouter.js";
const app = express();
const PORT = process.env.PORT || 5000;

connectDb();
dotenv.config({ path: "./.env.dev" });
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/", middlewareRouter);
app.use("/api/user", userRouter);
app.use("/api/event", eventRouter);
app.use("/api/ticket", ticketRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
