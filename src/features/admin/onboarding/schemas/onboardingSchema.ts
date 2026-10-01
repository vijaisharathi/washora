import * as z from "zod";

const indianPhoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

export const step1Schema = z.object({
  fullName: z
    .string({ required_error: "Full Name is required." })
    .min(2, "Full Name must be at least 2 characters."),
  workEmail: z
    .string({ required_error: "Work Email is required." })
    .email("Enter a valid work email address."),
  phone: z
    .string({ required_error: "Phone Number is required." })
    .min(10, "Phone number must be at least 10 digits.")
    .regex(
      indianPhoneRegex,
      "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210)."
    ),
  profileImage: z.string().optional(),
});

export const step2Schema = z.object({
  organizationName: z
    .string({ required_error: "Organization Name is required." })
    .min(1, "Organization Name is required."),
  organizationEmail: z
    .string({ required_error: "Organization Email is required." })
    .email("Enter a valid organization email address."),
  organizationPhone: z
    .string({ required_error: "Organization Phone is required." })
    .min(10, "Organization Phone must be at least 10 digits.")
    .regex(
      indianPhoneRegex,
      "Please enter a valid 10-digit Indian organization phone number."
    ),
  organizationType: z.enum(["washora", "partner", "internal-operations"], {
    required_error: "Organization Type is required.",
  }),
});

export const step3Schema = z.object({
  role: z.enum(["administrator", "operations-manager", "operations-executive"], {
    required_error: "Role is required.",
  }),
  primaryWorkArea: z.enum(
    [
      "customer-operations",
      "provider-operations",
      "delivery-operations",
      "platform-operations",
    ],
    {
      required_error: "Primary Work Area is required.",
    }
  ),
  preferredLanguage: z.enum(["english", "tamil"], {
    required_error: "Preferred Language is required.",
  }),
  timezone: z
    .string({ required_error: "Time Zone is required." })
    .min(1, "Time Zone is required."),
});

export const completeOnboardingSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type CompleteOnboardingFormData = z.infer<typeof completeOnboardingSchema>;
