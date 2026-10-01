import {
  DeliveryPartnerOnboardingDraft,
  DeliveryPartnerOnboardingStatus,
} from "@/types/delivery-partner";

export const MOCK_DELIVERY_PARTNER_ONBOARDING_DRAFT: DeliveryPartnerOnboardingDraft = {
  currentStep: 1,
  stage: "UNDER_VERIFICATION",
  submittedAt: "2026-09-02T14:30:00Z",
  personalInfo: {
    fullName: "Vikram Singh",
    phone: "+91 98765 43210",
    email: "vikram.valet@washora.example.com",
    aadhaarOrDlNumber: "5421 8890 1234",
    dob: "1997-08-15",
    address: "14th Cross, 100ft Road, Indiranagar",
    city: "Bengaluru",
  },
  vehicleInfo: {
    vehicleType: "ELECTRIC_BIKE",
    vehicleModel: "Ather 450X Pro Edition",
    vehiclePlate: "KA-01-EV-4289",
    drivingLicenseNumber: "KA-01-2018-0094821",
    dlExpiryDate: "2038-08-14",
    rcDocumentUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80",
    dlDocumentUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80",
  },
  shiftInfo: {
    preferredShift: "FLEXIBLE_FULL_DAY",
    hubName: "Indiranagar Hub #04",
    emergencyContactName: "Rajesh Singh (Brother)",
    emergencyContactPhone: "+91 98765 11223",
  },
  bankInfo: {
    accountHolderName: "Vikram Singh",
    bankName: "HDFC Bank Ltd",
    accountNumber: "50100428991204",
    ifscCode: "HDFC0000142",
    upiId: "vikram.valet@okhdfcbank",
  },
};

export const MOCK_DELIVERY_PARTNER_ONBOARDING_STATUS: DeliveryPartnerOnboardingStatus = {
  stage: "UNDER_VERIFICATION",
  submittedAt: "2026-09-02T14:30:00Z",
  estimatedReviewHours: 12,
  assignedHub: "Indiranagar Hub #04",
  reviewerNotes: "Document photos uploaded clearly. Automated background check in progress.",
};
