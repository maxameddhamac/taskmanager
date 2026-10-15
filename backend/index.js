import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

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

// 1. CORS Configuration (Ogolow Vercel iyo Localhost)
const allowedOrigins = [
  "https://taskmanager-henna-nine.vercel.app",
  "http://localhost:5173",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
    : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Ogolow request-yada aan lahayn origin (sida Postman ama mobile apps) iyo kuwa ku jira list-ka
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // AMA beddel 'callback(new Error("CORS Policy Error"))' haddii aad rabto inaad adkayso
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(helmet());
app.use(express.json());
app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(limiter);

// Health Check API
app.get("/api/health", (req, res) => {
  res.json("server is working ...👌");
});

// 2. API Routes
app.use("/api/users", usersroute);
app.use("/api/auth", authrouter);
app.use("/api/admin", adminroutes);
app.use("/api/upload", uploadRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Error Handlers
app.use(notfound);
app.use(errorHandler);

// 4. Start Server
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
