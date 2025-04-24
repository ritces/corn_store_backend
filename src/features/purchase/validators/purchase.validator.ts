import { z } from "zod";

// Schema to validate the incoming request body for purchasing a corn
export const createPurchaseSchema = z.object({
  name: z.string().min(2, { message: "Full name is required (min 2 chars)." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Valid phone number is required.",
  }),
  email: z.string().email({ message: "Valid email address is required." }),
  address: z.string().min(5, { message: "Address is required (min 5 chars)." }),
  city: z.string().min(2, { message: "City is required (min 2 chars)." }),
  postalCode: z
    .string()
    .regex(/^\d{4,10}$/, { message: "Valid postal code is required." }),
  totalPrice: z
    .number()
    .min(0, { message: "Total price must be greater than 0." }),
  status: z.enum(["Delivered"]),
});

// Type inferred from the schema
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
