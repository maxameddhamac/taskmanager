import express from "express";
import { uploud } from "../middleware/uploud.js";
import { uploadFile } from "../controllers/uploudcontroller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Route-ka saxda ah ee Profile Picture Upload-ka
router.post("/profile-picture", protect, uploud.single("file"), uploadFile);

export default router;
