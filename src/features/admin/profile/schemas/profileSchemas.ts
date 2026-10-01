import * as z from "zod";

const indianPhoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

export const adminProfileEditSchema = z.object({
  fullName: z
    .string({ required_error: "Full Name is required." })
    .min(2, "Full Name must be at least 2 characters."),
  workEmail: z
    .string({ required_error: "Work Email is required." })
    .email("Enter a valid work email address."),
  phone: z
    .string({ required_error: "Phone number is required." })
    .min(10, "Phone number must be at least 10 digits.")
    .regex(
      indianPhoneRegex,
      "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210)."
    ),
  profileImage: z.string().optional(),
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
  preferredLanguage: z.enum(["english", "tamil"]).default("english"),
  timezone: z.string().default("Asia/Kolkata"),
});

export const adminOrganizationEditSchema = z.object({
  name: z
    .string({ required_error: "Organization Name is required." })
    .min(2, "Organization Name must be at least 2 characters."),
  email: z
    .string({ required_error: "Organization Email is required." })
    .email("Enter a valid organization email address."),
  phone: z
    .string({ required_error: "Organization Phone is required." })
    .min(10, "Organization Phone must be at least 10 digits.")
    .regex(
      indianPhoneRegex,
      "Please enter a valid 10-digit Indian contact number."
    ),
  type: z.enum(["washora", "partner", "internal-operations"], {
    required_error: "Organization Type is required.",
  }),
});

export type AdminProfileEditFormData = z.infer<typeof adminProfileEditSchema>;
export type AdminOrganizationEditFormData = z.infer<typeof adminOrganizationEditSchema>;
