export type Role = "CUSTOMER" | "PROVIDER" | "DELIVERY_PARTNER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  defaultAddressId?: string;
  isPhoneVerified: boolean;
  memberSince: string;
  tier?: "Standard" | "Premium Member" | "VIP Care";
}

export interface ProfileUpdatePayload {
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export type AddressLabel = "Home" | "Work" | "Other";

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: AddressLabel;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  apartmentSuite?: string;
  city: string;
  state?: string;
  postalCode: string;
  landmark?: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface AddressFormData {
  label: AddressLabel;
  recipientName: string;
  phoneNumber: string;
  apartmentSuite: string;
  streetAddress: string;
  landmark?: string;
  postalCode: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface LocationPreference {
  areaName: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  servicesAvailableCount: number;
  providersNearbyCount: number;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  itemCount: number;
  startingPrice: number;
  imageUrl?: string;
}

export interface ServiceVariant {
  id: string;
  name: string;
  price: number;
  description?: string;
  turnaroundHours: number;
}

export interface ServiceAddon {
  id: string;
  name: string;
  price: number;
  description: string;
  recommendedFor?: string[];
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  unit: "per kg" | "per item" | "per pair" | "per set";
  variants: ServiceVariant[];
  addons: ServiceAddon[];
  imageUrl?: string;
  popular?: boolean;
}

export interface ProviderSummary {
  id: string;
  businessName: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  estimatedHours: number;
  isVerified: boolean;
  badge?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  priceRange: "₹" | "₹₹" | "₹₹₹";
}

export type OrderStatus =
  | "PENDING_CONFIRMATION"
  | "PICKUP_SCHEDULED"
  | "DRIVER_EN_ROUTE_PICKUP"
  | "PICKED_UP"
  | "IN_TRANSIT_TO_WORKSHOP"
  | "ITEM_INTAKE_INSPECTION"
  | "WASHING_PROCESSING"
  | "QUALITY_CHECK"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "ISSUE_REPORTED";

export interface OrderTimelineStep {
  id: string;
  title: string;
  description: string;
  status: "COMPLETED" | "ACTIVE" | "PENDING" | "FAILED";
  timestamp?: string;
}

export interface BookingCartItem {
  serviceId: string;
  serviceName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  selectedAddonIds: string[];
  specialInstructions?: string;
}

export interface BookingDraft {
  providerId?: string;
  items: BookingCartItem[];
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  addressId?: string;
  couponCode?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  providerId: string;
  providerName: string;
  status: OrderStatus;
  items: BookingCartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  pickupAddress: CustomerAddress;
  deliveryAddress: CustomerAddress;
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  timeline: OrderTimelineStep[];
  assignedDriver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    vehicleNumber: string;
  };
  pickupOtp?: string;
  deliveryOtp?: string;
  instructions?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
}


export interface Coupon {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "ORDER_UPDATE" | "PROMOTION" | "SECURITY" | "SUPPORT";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
