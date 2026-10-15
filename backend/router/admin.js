import express from "express";
import { createManagedUser, updateUserRole } from "../controllers/users.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { managedUserSchema } from "../schemas/userSchema.js";

const authrouter = express.Router();

authrouter.get("/dashboard", protect, authorize(`admin`), (req, res) => {
  res.json({ message: "Welcome to the dashboard" });
});
authrouter.post(
  "/users",
  protect,
  authorize("admin"),
  validate(managedUserSchema),
  createManagedUser,
);
authrouter.patch(
  "/users/:id/role",
  protect,
  authorize("admin"),
  updateUserRole,
);

export default authrouter;
