import express from "express";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
const port = 5000;

connectDb();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
