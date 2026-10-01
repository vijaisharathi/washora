import { z } from "zod";

export const providerBusinessIdentitySchema = z.object({
  businessName: z.string().min(2, "Business trade name is required"),
  legalEntityName: z.string().min(2, "Legal registered entity name is required"),
  businessCategory: z.string().min(1, "Service category is required"),
  entityType: z.enum(["proprietorship", "partnership", "llp", "private_limited"]),
  gstin: z.string().optional(),
  panNumber: z.string().min(10, "Valid 10-character PAN number is required"),
  establishedYear: z.string().min(4, "Established year is required"),
  description: z.string().min(10, "Please provide a brief studio description (min 10 characters)"),
});

export type ProviderBusinessIdentityFormData = z.infer<typeof providerBusinessIdentitySchema>;

export const providerContactInfoSchema = z.object({
  primaryEmail: z.string().email("Please enter a valid primary email address"),
  supportEmail: z.string().email("Please enter a valid support email address"),
  primaryPhone: z
    .string()
    .min(10, "Please enter a valid 10-digit mobile number")
    .regex(/^[0-9+ -]+$/, "Invalid phone number format"),
  emergencyHotline: z.string().optional(),
  websiteUrl: z.string().optional(),
});

export type ProviderContactInfoFormData = z.infer<typeof providerContactInfoSchema>;

export const providerBusinessAddressSchema = z.object({
  addressLine1: z.string().min(5, "Studio street address is required"),
  addressLine2: z.string().optional(),
  locality: z.string().min(2, "Locality / Area is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().length(6, "Valid 6-digit postal PIN code is required"),
  country: z.string().min(2, "Country is required"),
  landmark: z.string().optional(),
});

export type ProviderBusinessAddressFormData = z.infer<typeof providerBusinessAddressSchema>;

export const providerServiceAreaSchema = z.object({
  coverageRadiusKm: z.number().min(1).max(30),
  servicedLocalities: z.array(z.string()).min(1, "Enter at least one service locality"),
  expressPickupAvailable: z.boolean(),
});

export type ProviderServiceAreaFormData = z.infer<typeof providerServiceAreaSchema>;

export const providerOperatingHoursSchema = z.object({
  turnaroundSlaHours: z.number().min(12).max(96),
  acceptingEmergencyRush: z.boolean(),
});

export type ProviderOperatingHoursFormData = z.infer<typeof providerOperatingHoursSchema>;
