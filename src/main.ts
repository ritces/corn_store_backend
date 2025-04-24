import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import { disconnectPrisma } from "@/infrastructure/database/prisma.client";
import { disconnectRedisClient } from "@/infrastructure/redis/redis.client";

// Routes
import purchaseRoutes from "@/features/purchase/routes/purchase.route";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors());

// --- Routes ---;
app.use("/api/corns", purchaseRoutes);

// --- Health Check Route ---
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// --- Global Error Handler ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

const gracefulShutdown = async (signal: string) => {
  console.log(`
Received signal: ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections (existing connections will finish)
  server.close(async (err) => {
    if (err) {
      console.error("Error closing server:", err);
      process.exit(1); // Exit with error if server closing fails
    }
    console.log("HTTP server closed.");

    // Disconnect Prisma
    await disconnectPrisma();

    // Disconnect Redis (if it was used)
    await disconnectRedisClient();

    console.log("Graceful shutdown completed. Exiting.");
    process.exit(0);
  });

  // Force shutdown after a timeout if graceful shutdown takes too long
  setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000);
};

// --- Start Server and Listen for Signals ---
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
