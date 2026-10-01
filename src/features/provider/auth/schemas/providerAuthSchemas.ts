import { z } from "zod";

export const providerLoginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Please enter a valid partner email address or registered mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type ProviderLoginFormData = z.infer<typeof providerLoginSchema>;

export const providerRegisterSchema = z
  .object({
    category: z.string().min(1, "Please select your primary service category"),
    businessName: z.string().min(2, "Business name is required"),
    ownerName: z.string().min(2, "Owner name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .min(10, "Please enter a valid 10-digit mobile number")
      .regex(/^[0-9+ -]+$/, "Invalid phone number format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Partner Terms and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProviderRegisterFormData = z.infer<typeof providerRegisterSchema>;

export const providerOtpSchema = z.object({
  otp: z.string().length(6, "Verification code must be exactly 6 digits"),
});

export type ProviderOtpFormData = z.infer<typeof providerOtpSchema>;

export const providerForgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(3, "Please enter your registered partner email or mobile number"),
});

export type ProviderForgotPasswordFormData = z.infer<typeof providerForgotPasswordSchema>;

export const providerResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProviderResetPasswordFormData = z.infer<typeof providerResetPasswordSchema>;

export const providerBusinessInfoSchema = z.object({
  businessName: z.string().min(2, "Business trade name is required"),
  legalEntityName: z.string().min(2, "Legal registered entity name is required"),
  businessCategory: z.string().min(1, "Business category is required"),
  gstNumber: z.string().optional(),
  panNumber: z.string().min(10, "Valid 10-character business PAN is required"),
  businessType: z.enum(["proprietorship", "partnership", "llp", "private_limited"]),
  establishedYear: z.string().min(4, "Established year is required"),
});

export type ProviderBusinessInfoFormData = z.infer<typeof providerBusinessInfoSchema>;

export const providerLocationSchema = z.object({
  streetAddress: z.string().min(5, "Studio street address is required"),
  buildingSuite: z.string().optional(),
  locality: z.string().min(2, "Locality / Area is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().length(6, "Valid 6-digit PIN code is required"),
  coverageRadiusKm: z.number().min(1).max(50),
});

export type ProviderLocationFormData = z.infer<typeof providerLocationSchema>;

export const providerCapabilitiesSchema = z.object({
  primarySpecialties: z.array(z.string()).min(1, "Select at least one specialty"),
  turnaroundSlaHours: z.number().min(12).max(96),
  dailyCapacityUnits: z.number().min(5).max(1000),
  workingDays: z.array(z.string()).min(1, "Select working operational days"),
  workingHoursStart: z.string().min(1, "Start time is required"),
  workingHoursEnd: z.string().min(1, "End time is required"),
  pickupDropAvailable: z.boolean(),
});

export type ProviderCapabilitiesFormData = z.infer<typeof providerCapabilitiesSchema>;
