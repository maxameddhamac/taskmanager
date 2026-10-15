import { z } from "zod";

const userFields = {
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().toLowerCase(),
  password: z
    .string()
    .min(6)
    .max(100)
    .refine((password) => password.trim().length > 0),
};

export const userSchema = z
  .object({
    ...userFields,
    role: z.literal("user").default("user"),
  })
  .strict();

export const managedUserSchema = z
  .object({
    ...userFields,
    role: z.enum(["user", "admin"]),
  })
  .strict();

export const userUpdateSchema = z
  .object({
    name: userFields.name.optional(),
    email: userFields.email.optional(),
  })
  .strict()
  .refine((updates) => Object.keys(updates).length > 0, {
    message: "At least one user field must be provided",
  });
