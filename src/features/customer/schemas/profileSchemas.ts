import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name cannot exceed 60 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

export const addressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"], {
    required_error: "Please select an address label",
  }),
  recipientName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Full name cannot exceed 60 characters"),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  apartmentSuite: z
    .string()
    .min(2, "House/Flat No. & Building name is required"),
  streetAddress: z
    .string()
    .min(3, "Street, Area or Sector is required"),
  landmark: z.string().optional().or(z.literal("")),
  postalCode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  isDefault: z.boolean().default(false),
});

export type AddressSchemaFormData = z.infer<typeof addressSchema>;

export const locationSearchSchema = z.object({
  query: z.string().min(2, "Please enter at least 2 characters to search"),
});

export type LocationSearchFormData = z.infer<typeof locationSearchSchema>;
