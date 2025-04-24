import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "@/infrastructure/redis/redis.client";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 1;

/**
 * Express middleware to enforce rate limiting based on email.
 * Allows a maximum number of requests within a defined time window.
 */
export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const email = req.body.email;
  if (!email || typeof email !== "string") {
    console.warn("Rate limiter: Email missing or invalid in request body.");
    res.status(400).json({ message: "Email is required for purchase." });
    return;
  }

  const redisKey = `rate-limit:${email}`;
  let redisClient;

  try {
    redisClient = await getRedisClient();

    // Increment the count for this email. INCR is atomic.
    const currentRequests = await redisClient.incr(redisKey);

    // If this is the first request in the window, set the expiry.
    if (currentRequests === 1) {
      await redisClient.expire(redisKey, RATE_LIMIT_WINDOW_SECONDS);
      console.log(
        `Rate limiter: First request for ${email}. Key set with TTL ${RATE_LIMIT_WINDOW_SECONDS}s.`
      );
    }

    // Check if the limit is exceeded.
    if (currentRequests > MAX_REQUESTS_PER_WINDOW) {
      console.warn(
        `Rate limit exceeded for ${email}. Requests: ${currentRequests}`
      );

      // get TTL to inform the user when they can try again
      console.log("redisKey", redisKey);
      const ttl = await redisClient.ttl(redisKey);
      res.status(429).json({
        message: "Too Many Requests. You can only buy 1 corn per minute.",
        retryAfter: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS,
      });
      return;
    }

    console.log(
      `Rate limiter: Request count for ${email}: ${currentRequests}/${MAX_REQUESTS_PER_WINDOW}`
    );
    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during rate limit check." });
  }
};
