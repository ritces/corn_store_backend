import { PrismaClient } from "@/generated/prisma/client";

/**
 * Singleton instance of Prisma Client.
 */
let prismaInstance: PrismaClient | null = null;

/**
 * Gets the singleton instance of the Prisma Client.
 * Creates a new instance if one doesn't exist.
 * @returns The PrismaClient instance.
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    console.log("Creating new PrismaClient instance...");
    prismaInstance = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }
  return prismaInstance;
};

export const disconnectPrisma = async (): Promise<void> => {
  if (prismaInstance) {
    console.log("Attempting to disconnect Prisma client explicitly...");
    try {
      await prismaInstance.$disconnect();
      prismaInstance = null;
      console.log("Prisma client disconnected successfully.");
    } catch (error) {
      console.error("Error disconnecting Prisma client:", error);
    }
  }
};

export const prisma = getPrismaClient();
