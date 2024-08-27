import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.dev" });

export const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongoDB ", connection.connection.host);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
