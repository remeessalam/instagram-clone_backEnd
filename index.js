import http from "http";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import user from "./routes/user.js";
import post from "./routes/post.js";
import chat from "./routes/chat.js";
import notification from "./routes/notification.js";
import { errorHandler } from "./middleware/handlerror.js";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// --- Middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : '*',
    methods: ["GET", "POST"],
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// --- Routes ---
app.get("/", (req, res) => {
  res.send("Welcome to the Instagram Clone API");
});

app.use("/api/v1/users", user);
app.use("/api/v1/posts", post);
app.use("/api/v1/chats", chat);
app.use("/api/v1/notifications", notification);

// --- Error Handling ---
app.use(errorHandler);

// --- Server Initialization ---
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

// --- Graceful Shutdown ---
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default app;