import User from "../models/userModel.js";
import userSchema, { signinSchema } from "../schemas/userSchema.js";
import bcrypt from "bcryptjs";
import { hashPassword } from "../utils/hashPassword.js";
import { ApiError, ApiResponse } from "../utils/ApiResponses.js";
import jwt from "jsonwebtoken";
import { tokenExpiry } from "../utils/tokenExpiry.js";

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

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: tokenExpiry });

    res.cookie("token", token, {
      maxAge: tokenExpiry * 1000,
      httpOnly: true,
    });

    return res.status(201).json({ message: "user created successfully", data: newUser, token: token });
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: 1296000 });
    res.cookie("token", token, {
      maxAge: tokenExpiry * 1000,
      httpOnly: true,
    });
    return res.status(200).json({ message: "user logged in successfully", data: user, token: token });
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const passwordSchema = userSchema.pick({ password: true });
    const validatePasswordStrength = passwordSchema.safeParse({ password });

    if (!validatePasswordStrength.success) {
      const error = validatePasswordStrength.error.issues[0].message;
      return res.status(400).json(new ApiError(400, error));
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.findOneAndUpdate({ email: email }, { password: hashedPassword });

    res.status(200).json(new ApiResponse(200, "Password updated successfully", user));
  } catch (error) {}
};
