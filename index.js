import express from "express";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import middlewareRouter from "./routes/middlewareRouter.js";
import eventRouter from "./routes/eventRoutes.js";
import googleAuthRouter from "./routes/googleAuthRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import setupPassport from "./services/passport.js";
import paymentrouter from "./routes/paymentRoutes.js";
import ticketRouter from "./routes/ticketRouter.js";
import promotionRouter from "./routes/promotionRoutes.js";
import premiereRouter from "./routes/premiereRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDb();
dotenv.config();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    
  })
);
app.use(express.json());
app.use(cookieParser());
setupPassport(app);

app.use("/", middlewareRouter);
app.use("/api/user", userRouter);
app.use("/api/event", eventRouter);
app.use("/auth", googleAuthRouter);
// app.use("/", middlewareRouter);
app.use("/api/ticket", ticketRouter);
app.use("/api/payment", paymentrouter);
app.use("/api/promotions", promotionRouter);
app.use("/api/premiere", premiereRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
