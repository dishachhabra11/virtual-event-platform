import User from "../models/userModel.js";
import userSchema, { signinSchema } from "../schemas/userSchema.js";
import bcrypt from "bcryptjs";
import { hashPassword } from "../utils/hashPassword.js";
import { ApiResponse, ApiError } from "../utils/ApiResponses.js";

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const validatedUser = userSchema.safeParse(req.body);

    if (!validatedUser.success) {
      const error = validatedUser.error.issues[0].message;
      return res.status(400).json(new ApiError(400, error));
    }

    const alreadyExists = await User.findOne({
      email: validatedUser.data.email,
    });
    if (alreadyExists) {
      return res.status(409).json(new ApiError(409, "User already exists"));
    }
    const hashedPassword = (await hashPassword(password)).toString();

    const newUser = new User({ name, username, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json( new ApiResponse(201, "User created successfully", newUser));
  } catch (error) {
    return res.status(500).json( new ApiError(500, error.message));
  }
};

export const signin = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const validatedUser = signinSchema.safeParse(req.body);
    if (!validatedUser.success) {
      const error = validatedUser.error.issues[0].message;
      return res.status(400).json(new ApiError(400, error));
    }
    const user = await User.findOne({ email: validatedUser.data.email });
    if (!user) {
      return res.status(401).json(new ApiError(401, "User not found"));
    }
    console.log(user);
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(new ApiError(401, "Invalid password"));
    }
    return res.status(200).json(new ApiResponse(200, "User signed in successfully", user));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
