import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import path from "path";
import { fileURLToPath, fileURLToPathBuffer } from "url";

import usersroute from "./router/users.js";
import uploadRouter from "./router/upload.js";
import taskRouter from "./router/task.js";
import authrouter from "./router/auth.js";
import adminroutes from "./router/admin.js";

import logger from "./middleware/logger.js";
import notfound from "./middleware/notfound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { limiter } from "./middleware/rateLimiter.js";
import { swaggerSpec } from "./utilities/swagger.js";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));

app.use(helmet());
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "*",
//   }),
// );
app.use(express.json());
app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(limiter);

app.get("/api/health", (req, res) => {
  res.json("server is working ...👌");
});

app.use("/api/users", usersroute);
app.use("/api/auth", authrouter);
app.use("/api/admin", adminroutes);
app.use("/api/upload", uploadRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//server frontend in production

if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Serve the frontend app

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
  });
}

app.use(notfound);
app.use(errorHandler);

const startServer = async () => {
  if (!process.env.jwtSecret && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in Environment Variables.");
  }

  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGO_URI_PRO ||
    process.env.MONGO_URI_DEV;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured in Environment Variables.");
  }

  await mongoose.connect(mongoUri);
  console.log("Database connected successfully");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});
