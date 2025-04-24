import { Purchase } from "@/generated/prisma/client";
import {
  purchaseRepositoryInstance,
  PurchaseRepository,
} from "../repositories/purchase.repository";
import type { CreatePurchaseInput } from "../validators/purchase.validator";

export class PurchaseService {
  constructor(private repository: PurchaseRepository) {
    console.log("PurchaseService initialized");
  }

  /**
   * Processes a corn purchase request.
   * Currently, this mainly involves recording the purchase.
   * @param purchaseInput - Validated data for the purchase.
   * @returns The newly created Purchase record.
   */
  async createPurchase(purchaseInput: CreatePurchaseInput): Promise<Purchase> {
    console.log(`Processing purchase for email: ${purchaseInput.email}`);

    try {
      console.log({ purchaseInput });
      const newPurchase = await this.repository.createPurchase(purchaseInput);
      return newPurchase;
    } catch (error) {
      console.error("Error processing purchase:", error);
      throw new Error("Could not process the purchase.");
    }
  }

  /**
   * Retrieves all purchase records for a given email.
   * @returns An array of Purchase objects.
   */
  async getAllPurchasesByEmail(): Promise<Purchase[]> {
    console.log(`Fetching purchase history`);
    try {
      const history = await this.repository.getAllPurchasesByEmail();
      return history;
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      throw new Error("Could not retrieve purchase history.");
    }
  }
}

// Export a singleton instance of the service, injecting the repository instance
export const purchaseService = new PurchaseService(purchaseRepositoryInstance);
