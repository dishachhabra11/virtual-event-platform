import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const connection = await mongoose.connect("mongodb+srv://admin:12345678cluster@cluster0.gvklmyl.mongodb.net/virtualEvent");
    console.log("Connected to mongoDB ", connection.connection.host);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
