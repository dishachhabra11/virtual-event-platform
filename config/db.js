import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to mongoDB ", connection.connection.host);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
