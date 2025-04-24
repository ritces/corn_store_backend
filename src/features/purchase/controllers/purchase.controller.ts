import { Request, Response } from "express";
import { ZodError } from "zod";
import { purchaseService, PurchaseService } from "../services/purchase.service";
import { createPurchaseSchema } from "../validators/purchase.validator";

export class PurchaseController {
  constructor(private service: PurchaseService) {
    console.log("PurchaseController initialized");
  }

  /**
   * Handles the POST request to purchase a corn.
   * Validates input, calls the service, and sends the response.
   */
  async handlePurchaseRequest(req: Request, res: Response): Promise<void> {
    try {
      // 1. Validate request body
      const validatedData = createPurchaseSchema.parse(req.body);
      console.log(
        "Purchase request validation successful for:",
        validatedData.email
      );

      // service to process the purchase
      await this.service.createPurchase(validatedData);

      console.log("Purchase successful, sending 200 response.");
      res.status(200).send({ message: "Purchase successful" });
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn("Purchase request validation failed:", error.errors);
        res.status(400).json({
          message: "Invalid purchase data",
          errors: error.flatten().fieldErrors,
        });
        return;
      }

      console.error("Error handling purchase request:", error);
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  /**
   * Handles the GET request to retrieve all purchases for a given email.
   * Validates input, calls the service, and sends the response.
   */
  async handleGetPurchasesRequest(req: Request, res: Response): Promise<void> {
    try {
      const purchases = await this.service.getAllPurchasesByEmail();
      res.status(200).json(purchases);
    } catch (error) {
      console.error("Error handling get purchases request:", error);
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }
}

// Export a singleton instance of the controller, injecting the service instance
export const purchaseController = new PurchaseController(purchaseService);
