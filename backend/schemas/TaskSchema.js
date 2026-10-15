import { z } from "zod";

const taskFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().optional(),
  status: z.enum(["pending", "in progress", "completed"]).optional(),
  dueDate: z.string().optional(),
};

export const taskValidationSchema = z.object(taskFields).strict();

export const taskUpdateValidationSchema = z
  .object(taskFields)
  .partial()
  .strict()
  .refine((task) => Object.keys(task).length > 0, {
    message: "At least one task field must be provided",
  });
