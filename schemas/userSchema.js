import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  username: z.string(3, "username must be atleast 3 characters long"),
  email: z.string().email("invalid email"),
  password: z
    .string()
    .min(6, "password must be 8 characters long")
    .max(100, "password must be less than 100 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, "Password must contain atleast one uppercase, lowercase, number and special character"),
});

export const signinSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

export default userSchema;
