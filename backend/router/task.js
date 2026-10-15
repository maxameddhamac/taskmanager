import express from "express";
import mongoose from "mongoose";
import {
  createTask,
  getMyTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import {
  taskValidationSchema,
  taskUpdateValidationSchema,
} from "../schemas/TaskSchema.js";

const router = express.Router();

router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  return next();
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tasks
 */

router.post("/", protect, validate(taskValidationSchema), createTask);
/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in progress, completed]
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */

router.get("/", protect, getMyTasks);
/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 */

router.put("/:id", protect, validate(taskUpdateValidationSchema), updateTask);
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */

router.delete("/:id", protect, deleteTask);

export default router;
