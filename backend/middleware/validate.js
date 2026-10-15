import { userSchema } from "../schemas/userSchema.js";

export const validate =
  (schema = userSchema) =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map(({ path, message }) => ({
          field: path.join("."),
          message,
        })),
      });
    }
    req.body = result.data;
    return next();
  };
