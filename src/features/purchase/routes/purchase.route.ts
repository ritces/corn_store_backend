import express, { Request, Response, NextFunction } from "express";
import { purchaseController } from "../controllers/purchase.controller";
import { rateLimiterMiddleware } from "../middlewares/rateLimiter.middleware";

const router = express.Router();

router.post(
  "/purchase",
  rateLimiterMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await purchaseController.handlePurchaseRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/purchases",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await purchaseController.handleGetPurchasesRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
