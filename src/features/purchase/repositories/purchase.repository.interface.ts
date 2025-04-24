import { Purchase } from "@/generated/prisma/client";
import { CreatePurchaseInput } from "../validators/purchase.validator";
/**
 * Interface defining the contract for purchase data access operations.
 */
export interface IPurchaseRepository {
  /**
   * Creates a new purchase record in the database.
   * @param purchaseInput - The purchase input data.
   * @returns The created Purchase object.
   */
  createPurchase(purchaseInput: CreatePurchaseInput): Promise<Purchase>;

  /**
   * Retrieves all purchase records for a given email.
   * @param email - The email of the client.
   * @returns An array of Purchase objects.
   */
  getAllPurchasesByEmail(email: string): Promise<Purchase[]>;
}
