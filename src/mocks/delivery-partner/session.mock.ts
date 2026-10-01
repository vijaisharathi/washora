import { DeliveryPartnerProfile, DeliveryPartnerSession } from "@/types/delivery-partner";

export const MOCK_DELIVERY_PARTNER_PROFILE: DeliveryPartnerProfile = {
  id: "dp-1",
  name: "Vikram Singh",
  phone: "+91 98765 43210",
  email: "vikram.valet@washora.example.com",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  rating: 4.85,
  totalDeliveries: 482,
  acceptanceRate: 98.4,
  onTimeRate: 99.1,
  vehicleType: "ELECTRIC_BIKE",
  vehicleModel: "Ather 450X Pro Edition",
  vehiclePlate: "KA-01-EV-4289",
  status: "ONLINE",
  isKycVerified: true,
  city: "Bengaluru",
  hubName: "Indiranagar Hub #04",
  joinedDate: "2025-11-14T08:30:00Z",
};

export const MOCK_DELIVERY_PARTNER_SESSION: DeliveryPartnerSession = {
  isAuthenticated: true,
  token: "washora_mock_dp_jwt_token_88492048",
  partner: MOCK_DELIVERY_PARTNER_PROFILE,
  expiresAt: "2026-12-31T23:59:59Z",
  lastActive: "2026-09-03T16:00:00Z",
};
