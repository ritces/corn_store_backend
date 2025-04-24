import { PrismaClient, Purchase } from "@/generated/prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client";
import { IPurchaseRepository } from "./purchase.repository.interface";
import { CreatePurchaseInput } from "../validators/purchase.validator";

export class PurchaseRepository implements IPurchaseRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
    console.log("PurchaseRepository initialized");
  }

  /**
   * Creates a new purchase record in the database.
   * @param email - The email of the client making the purchase.
   * @returns The created Purchase object.
   */
  async createPurchase(purchaseInput: CreatePurchaseInput): Promise<Purchase> {
    try {
      console.log(`Creating purchase record for email: ${purchaseInput.email}`);
      const newPurchase = await this.prisma.purchase.create({
        data: purchaseInput,
      });
      console.log(`Purchase record created with ID: ${newPurchase.id}`);
      return newPurchase;
    } catch (error) {
      console.error("Error creating purchase record:", error);
      throw new Error("Failed to create purchase record");
    }
  }

  /**
   * Retrieves all purchase records for a given email.
   * @returns An array of Purchase objects.
   */
  async getAllPurchasesByEmail(): Promise<Purchase[]> {
    try {
      return await this.prisma.purchase.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error getting all purchases:", error);
      throw new Error("Failed to get all purchases");
    }
  }
}

// Export a singleton instance of the repository
export const purchaseRepositoryInstance = new PurchaseRepository();
