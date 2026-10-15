import express from "express";
import {
  getusers,
  getuserinfo,
  createUser,
  updateUser,
  createManagedUser,
} from "../controllers/users.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { userSchema, userUpdateSchema } from "../schemas/userSchema.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", getusers);
router.get("/:id", authorize("admin"), getuserinfo);

router.post("/register", validate(userSchema), createUser);

// Single User Create & Update Operations
router.post("/createuser", protect, authorize("admin"), createUser);
router.put(
  "/updateuser/:id",
  protect,
  authorize("admin"),
  validate(userUpdateSchema),
  updateUser,
);

export default router;
