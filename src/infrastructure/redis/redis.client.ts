import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

let redisClient: RedisClientType | null = null;
let isConnecting = false;

/**
 * Gets the singleton instance of the Redis Client.
 * Creates a new instance and connects if one doesn't exist or is not ready.
 * Handles potential connection errors.
 * @returns A promise that resolves with the connected RedisClientType instance.
 * @throws Error if connection fails.
 */
export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isReady) {
    return redisClient;
  }

  if (isConnecting) {
    // Avoid multiple connection attempts simultaneously
    // Wait for the existing connection attempt to complete
    console.log("Redis client already connecting, waiting...");
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isConnecting) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100); // Check every 100ms
    });

    if (redisClient && redisClient.isReady) {
      return redisClient;
    }

    throw new Error(
      "Failed to connect to Redis after waiting for existing connection attempt."
    );
  }

  isConnecting = true;
  console.log("Creating and connecting new Redis client instance...");

  try {
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
      },
      password: process.env.REDIS_PASSWORD,
    });

    client.on("error", (err) => {
      console.error("Redis Client Error", err);
      redisClient = null;
      isConnecting = false;
    });

    client.on("connect", () => console.log("Redis client connecting..."));
    client.on("ready", () => {
      console.log("Redis client is ready.");
      isConnecting = false;
    });
    client.on("end", () => {
      console.log("Redis client connection ended.");
      redisClient = null;
      isConnecting = false;
    });

    await client.connect();
    redisClient = client as RedisClientType;

    // Optional: Graceful shutdown
    process.on("beforeExit", async () => {
      if (redisClient && redisClient.isOpen) {
        console.log("Disconnecting Redis client...");
        await redisClient.quit();
      }
    });

    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    isConnecting = false;
    redisClient = null;
    throw error;
  } finally {
    isConnecting = false;
  }
};

/**
 * Attempts to gracefully disconnect the Redis client.
 */
export const disconnectRedisClient = async (): Promise<void> => {
  const client = redisClient;
  if (client && client.isOpen) {
    console.log("Attempting to disconnect Redis client explicitly...");
    try {
      await client.quit();
      // redisClient = null;
      console.log("Redis client disconnected successfully.");
    } catch (error) {
      console.error("Error disconnecting Redis client:", error);
    }
  } else {
    console.log("Redis client already disconnected or not initialized.");
  }
};
