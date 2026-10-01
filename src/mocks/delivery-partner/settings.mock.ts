import {
  DeliveryPartnerPreferences,
  DeliveryPartnerSecuritySettings,
} from "@/types/delivery-partner";

export const MOCK_PREFERENCES: DeliveryPartnerPreferences = {
  partnerId: "dp-1",
  navigationApp: "GOOGLE_MAPS",
  language: "en-IN",
  audioChimeEnabled: true,
  autoAcceptPriorityOrders: false,
  highContrastMode: false,
  vibrationFeedback: true,
};

export const MOCK_SECURITY_SETTINGS: DeliveryPartnerSecuritySettings = {
  twoFactorAuthEnabled: true,
  biometricLoginEnabled: false,
  lastPasswordChanged: "2026-08-15T14:30:00Z",
};
