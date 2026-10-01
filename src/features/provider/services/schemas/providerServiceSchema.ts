import { z } from "zod";

export const providerServiceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  category: z.enum(["laundry", "shoes", "bags", "helmets", "vehicles"], {
    errorMap: () => ({ message: "Please select a valid service category" }),
  }),
  description: z.string().min(10, "Please provide a detailed care description (min 10 characters)"),
  price: z.coerce.number().min(49, "Minimum service price is ₹49").max(50000, "Maximum service price is ₹50,000"),
  durationMinutes: z.coerce.number().min(10, "Minimum duration is 10 minutes").max(480, "Maximum duration is 8 hours"),
  turnaroundHours: z.coerce.number().min(6, "Minimum SLA is 6 hours").max(168, "Maximum SLA is 7 days"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  iconName: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type ProviderServiceFormData = z.infer<typeof providerServiceSchema>;
