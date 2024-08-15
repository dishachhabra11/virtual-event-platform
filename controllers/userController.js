import User from "../models/userModel.js";
import userSchema from "../schemas/userSchema.js";
import bcrypt from "bcryptjs";

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
    }
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

