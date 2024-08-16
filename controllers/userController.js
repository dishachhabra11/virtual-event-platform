import User from "../models/userModel.js";
import userSchema, { signinSchema } from "../schemas/userSchema.js";
import bcrypt from "bcryptjs";

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const validatedUser = userSchema.safeParse(req.body);

    if (!validatedUser.success) {
      const error = validatedUser.error.issues[0].message;
      return res.status(400).json({ error: error });
    }

    const alreadyExists = await User.findOne({
      email: validatedUser.data.email,
    });
    if (alreadyExists) {
      return res.status(409).json({ error: "User already exists" });
    }
    const hashedPassword = (await hashPassword(password)).toString();

    const newUser = new User({ name, username, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({
      message: "User successfully created",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const validatedUser = signinSchema.safeParse(req.body);
    if (!validatedUser.success) {
      const error = validatedUser.error.issues[0].message;
      return res.status(400).json({ error: error });
    }
    const user = await User.findOne({ email: validatedUser.data.email });
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }
    console.log(user);
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }
    return res.status(200).json({
      message: "user successfully logged in",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
