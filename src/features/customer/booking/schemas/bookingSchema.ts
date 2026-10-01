import { z } from "zod";

export const bookingFormSchema = z.object({
  serviceId: z.string().min(1, "Please select a care service"),
  providerId: z.string().optional(),
  variantId: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").max(20, "Maximum 20 items per booking"),
  addressId: z.string().min(1, "Please select a pickup & delivery address"),
  pickupDate: z.string().min(1, "Please select a pickup date"),
  pickupTimeSlotId: z.string().min(1, "Please select a pickup time window"),
  specialInstructions: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
