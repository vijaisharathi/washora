import { ProviderFullProfile } from "@/types/provider/profile";

export const MOCK_PROVIDER_FULL_PROFILE: ProviderFullProfile = {
  id: "prov-1",
  providerCode: "AC-7829",
  identity: {
    businessName: "LuxeCare Garment Studio",
    legalEntityName: "LuxeCare Fabric Care Services LLP",
    businessCategory: "laundry",
    entityType: "llp",
    gstin: "29AABCU9603R1ZM",
    panNumber: "AABCU9603R",
    establishedYear: "2021",
    description:
      "Premier artisanal dry cleaning, shoe spa restoration, and couture garment preservation facility operating with eco-solvent hydrocarbon technologies in Bangalore.",
    logoUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBsQH7VcP89Bk4dS23ANzW2pOIMnVOmSU-XEG61jIS6NVqOxRAoK_C2PkDHVLjZYbO-WcpVvtpy3BUu0SpVsqtSoU8Z5p4Nkmpi24XmqxNJNQ6FhU4A5dbPNqr9VKVThVAue9QvZK_17MThkexgZi3ur91-2-pr63F3RIjvgtU_EeYS-UAzRV9Fw_hpUXBZIE5nNvg0n-syfFT5vvHfIvKWHpGLdKHG2XTnnWeXg_j8HPWAgISRFylufQ",
    coverPhotoUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABxy9ACF2PggW-miJxBVnHSLaM0zDrBK6BbuyoxhzjH0_KLggAWg6URLMda8QQc3jm14XBoA3w_BxS144EeADBkwy-KmF_90T39okc4xOQQfl07E4bfW92osroo4exYsrLMvzESS_4tStwnkLYuceapwr77h66N85sxHkEXm46fqZ5-Jo2lpCsHo1ax0L82ovitacaq_O_SE2zGj1ovAFywQy4RDcQnN1R9_xBt_HxmC_6AbZDxM7xsQ",
  },
  contact: {
    primaryEmail: "partner@luxecare.example.com",
    supportEmail: "care@luxecare.example.com",
    primaryPhone: "+91 98401 23456",
    emergencyHotline: "+91 80 4123 9999",
    websiteUrl: "https://luxecare.example.com",
  },
  address: {
    addressLine1: "Shop 14, Ground Floor, Indiranagar Galleria",
    addressLine2: "100 Feet Road, HAL 2nd Stage",
    locality: "Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560038",
    country: "India",
    landmark: "Opposite Metro Pillar 114",
    latitude: 12.9783,
    longitude: 77.6408,
  },
  operatingHours: {
    schedule: [
      { day: "Monday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Tuesday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Wednesday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Thursday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Friday", isOpen: true, openTime: "08:00 AM", closeTime: "08:00 PM" },
      { day: "Saturday", isOpen: true, openTime: "09:00 AM", closeTime: "09:00 PM" },
      { day: "Sunday", isOpen: false, openTime: "10:00 AM", closeTime: "04:00 PM" },
    ],
    turnaroundSlaHours: 24,
    acceptingEmergencyRush: true,
  },
  serviceArea: {
    coverageRadiusKm: 8,
    servicedPostalCodes: ["560038", "560008", "560075", "560001", "560025"],
    servicedLocalities: ["Indiranagar", "Domlur", "Koramangala", "Ulsoor", "HAL Layout"],
    expressPickupAvailable: true,
  },
  verification: {
    overallProgressPercent: 100,
    isKycVerified: true,
    isBankVerified: true,
    isStorefrontVerified: true,
    isTradeLicenseVerified: true,
    statusBadge: "ACTIVE_VERIFIED",
  },
  updatedAt: "2026-09-02T16:00:00Z",
};
