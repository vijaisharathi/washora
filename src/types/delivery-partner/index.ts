/**
 * Type definitions for WASHORA Delivery Partner Frontend (D0, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12 & D13)
 */

export type DeliveryPartnerRole = "DELIVERY_PARTNER";

export type DeliveryPartnerStatus =
  | "OFFLINE"
  | "ONLINE"
  | "BUSY"
  | "ON_DELIVERY"
  | "ON_BREAK"
  | "SUSPENDED";

export type VehicleType =
  | "MOTORCYCLE"
  | "SCOOTER"
  | "ELECTRIC_BIKE"
  | "VAN"
  | "BICYCLE";

export interface DeliveryPartnerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  rating: number; // e.g. 4.85
  totalDeliveries: number;
  acceptanceRate: number; // e.g. 98%
  onTimeRate: number; // e.g. 99%
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  status: DeliveryPartnerStatus;
  isKycVerified: boolean;
  city: string;
  hubName: string;
  joinedDate: string;
}

export interface DeliveryPartnerFullProfile extends DeliveryPartnerProfile {
  aadhaarOrDlNumber: string;
  dob: string;
  address: string;
  drivingLicenseNumber: string;
  dlExpiryDate: string;
  rcDocumentUrl?: string;
  dlDocumentUrl?: string;
  preferredShift: "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE_FULL_DAY";
  serviceRadiusKm: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export interface UpdatePersonalInfoPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  avatarUrl?: string;
}

export interface UpdateVehicleInfoPayload {
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  drivingLicenseNumber: string;
  dlExpiryDate: string;
}

export interface UpdateShiftHubPayload {
  preferredShift: "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE_FULL_DAY";
  hubName: string;
  serviceRadiusKm: number;
}

export interface UpdateBankInfoPayload {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export interface DeliveryPartnerSession {
  isAuthenticated: boolean;
  token: string | null;
  partner: DeliveryPartnerProfile | null;
  expiresAt: string | null;
  lastActive: string;
  onboardingStage?: DeliveryPartnerOnboardingStage;
}

export interface DeliveryPartnerAuthCredentials {
  identifier: string; // phone or email
  password?: string;
  otp?: string;
  rememberMe?: boolean;
}

export interface DeliveryPartnerRegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  vehicleType: VehicleType;
  password?: string;
}

export type DeliveryPartnerOnboardingStage =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_VERIFICATION"
  | "APPROVED"
  | "REJECTED";

export interface DeliveryPartnerOnboardingDraft {
  currentStep: number; // 1 to 4
  stage: DeliveryPartnerOnboardingStage;
  submittedAt?: string;
  personalInfo: {
    fullName: string;
    phone: string;
    email: string;
    aadhaarOrDlNumber: string;
    dob: string;
    address: string;
    city: string;
  };
  vehicleInfo: {
    vehicleType: VehicleType;
    vehicleModel: string;
    vehiclePlate: string;
    drivingLicenseNumber: string;
    dlExpiryDate: string;
    rcDocumentUrl?: string;
    dlDocumentUrl?: string;
  };
  shiftInfo: {
    preferredShift: "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE_FULL_DAY";
    hubName: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
  bankInfo: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
}

export interface DeliveryPartnerOnboardingStatus {
  stage: DeliveryPartnerOnboardingStage;
  submittedAt?: string;
  estimatedReviewHours: number;
  assignedHub: string;
  reviewerNotes?: string;
}

export type TaskStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKUP_STARTED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "ARRIVED_AT_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED";

export type TaskType =
  | "CUSTOMER_PICKUP"
  | "HUB_TRANSFER"
  | "CUSTOMER_DELIVERY";

export interface TaskTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

export interface DeliveryPartnerTask {
  id: string;
  partnerId: string;
  orderId: string;
  type: TaskType;
  status: TaskStatus;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemSummary: string;
  itemsList: string[];
  packageCount: number;
  scheduledTimeWindow: string;
  distanceKm: number;
  payoutAmount: number;
  isPriority?: boolean;
  notes?: string;
  createdAt: string;
  estimatedDurationMins: number;
  timeline: TaskTimelineEvent[];
}

export type DeliveryPartnerTaskPreview = Omit<DeliveryPartnerTask, "itemsList" | "timeline">;

export interface TaskFilterParams {
  category?: "ALL" | "AVAILABLE" | "ASSIGNED" | "IN_TRANSIT" | "COMPLETED";
  searchQuery?: string;
  type?: TaskType | "ALL";
  date?: string;
}

export type PickupStep =
  | "ARRIVE"
  | "VERIFY_ITEMS"
  | "SECURITY_TAGS"
  | "CONFIRM_OTP"
  | "COMPLETED";

export interface PickupVerificationState {
  taskId: string;
  arrivedAtLocation: boolean;
  verifiedItemIndexes: number[];
  securitySealTagCode: string;
  pickupOtp: string;
  isOtpVerified: boolean;
  completedAt?: string;
}

export type PickupIssueType =
  | "LOCATION_INACCESSIBLE"
  | "CUSTOMER_UNAVAILABLE"
  | "PACKAGE_COUNT_MISMATCH"
  | "GARMENT_DAMAGED"
  | "WEATHER_DELAY"
  | "OTHER";

export interface PickupIssueReportPayload {
  taskId: string;
  orderId: string;
  issueType: PickupIssueType;
  description: string;
  photosUploaded?: number;
}

export type DeliveryStep =
  | "TRANSIT"
  | "ARRIVE"
  | "VERIFY_HANDOVER"
  | "CONFIRM_OTP"
  | "COMPLETED";

export interface DeliveryHandoverState {
  taskId: string;
  arrivedAtLocation: boolean;
  recipientConfirmed: boolean;
  securitySealIntact: boolean;
  deliveryOtp: string;
  isOtpVerified: boolean;
  proofOfDeliveryUrl?: string;
  customerNotes?: string;
  completedAt?: string;
}

export type DeliveryIssueType =
  | "CUSTOMER_UNAVAILABLE"
  | "CUSTOMER_REFUSED"
  | "INCORRECT_ADDRESS"
  | "HANDOVER_FAILED"
  | "PACKAGE_DAMAGED"
  | "WEATHER_DELAY"
  | "OTHER";

export interface DeliveryIssueReportPayload {
  taskId: string;
  orderId: string;
  issueType: DeliveryIssueType;
  description: string;
  photosUploaded?: number;
}

export interface RouteStop {
  stopNumber: number;
  taskId: string;
  orderId: string;
  type: TaskType;
  status: TaskStatus;
  customerName: string;
  address: string;
  timeWindow: string;
  distanceKm: number;
  payoutAmount: number;
  isCompleted: boolean;
  estimatedEta: string;
}

export interface DeliveryPartnerDaySchedule {
  date: string;
  shiftName: string;
  shiftHours: string;
  hubName: string;
  totalStops: number;
  completedStops: number;
  remainingStops: number;
  totalDistanceKm: number;
  stops: RouteStop[];
}

export interface RescheduleStopPayload {
  taskId: string;
  newTimeWindow: string;
  reason: string;
}

export type EarningStatus = "SETTLED" | "PENDING_SETTLEMENT" | "PROCESSING";

export interface DeliveryEarningTransaction {
  id: string;
  partnerId: string;
  taskId: string;
  orderId: string;
  date: string;
  taskType: TaskType;
  basePay: number;
  distancePay: number;
  fuelSurgeIncentive: number;
  tipAmount: number;
  totalEarned: number;
  status: EarningStatus;
  payoutId?: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
}

export type PayoutStatus = "COMPLETED" | "PROCESSING" | "FAILED" | "PENDING";

export interface PayoutRecord {
  id: string;
  partnerId: string;
  payoutReference: string;
  utrNumber: string;
  amount: number;
  status: PayoutStatus;
  initiatedAt: string;
  settledAt?: string;
  periodCovered: string;
  paymentMethod: string;
  tripCount: number;
}

export interface DeliveryPartnerEarningsSummary {
  availableBalance: number;
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  lifetimeEarnings: number;
  pendingSettlementAmount: number;
  totalSettledAmount: number;
  weeklyDailyBreakdown: { day: string; amount: number; tripCount: number }[];
  recentTransactions: DeliveryEarningTransaction[];
  payoutHistory: PayoutRecord[];
  paymentMethodSummary: {
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    upiIdMasked: string;
    autoSettlementSchedule: string;
  };
}

export interface RequestPayoutPayload {
  amount: number;
  paymentMethodType: "BANK_TRANSFER" | "UPI";
  notes?: string;
}

export type DeliveryHistoryOutcome = "DELIVERED" | "PICKED_UP" | "CANCELLED" | "FAILED";

export interface DeliveryHistoryRecord {
  id: string;
  partnerId: string;
  taskId: string;
  orderId: string;
  type: TaskType;
  outcome: DeliveryHistoryOutcome;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  completedAt: string;
  packageCount: number;
  itemsList: string[];
  distanceKm: number;
  earnedAmount: number;
  securitySealCode?: string;
  verificationMethod?: string;
  notes?: string;
  failureReason?: string;
  timeline: TaskTimelineEvent[];
}

export interface DeliveryHistorySummary {
  totalCompletedTrips: number;
  totalDistanceKm: number;
  onTimeRate: number;
  totalHistoricalEarnings: number;
  records: DeliveryHistoryRecord[];
}

export interface HistoryFilterParams {
  outcome?: "ALL" | "DELIVERED" | "PICKED_UP" | "CANCELLED" | "FAILED";
  searchQuery?: string;
  datePreset?: "ALL" | "THIS_WEEK" | "THIS_MONTH" | "PAST_30_DAYS";
}

export interface DeliveryPartnerReview {
  id: string;
  partnerId: string;
  taskId: string;
  orderId: string;
  rating: number; // 1 to 5
  customerName: string;
  date: string;
  comment: string;
  compliments: string[];
  deliveryAddress: string;
}

export interface RatingDistributionItem {
  stars: number;
  count: number;
  percentage: number;
}

export interface DeliveryPartnerReviewsSummary {
  averageRating: number;
  totalReviews: number;
  fiveStarPercentage: number;
  distribution: RatingDistributionItem[];
  topCompliments: { tag: string; count: number }[];
  reviews: DeliveryPartnerReview[];
}

export interface ReviewFilterParams {
  rating?: "ALL" | "5" | "4" | "3" | "LOW";
  sortBy?: "NEWEST" | "HIGHEST_RATED" | "LOWEST_RATED";
  searchQuery?: string;
}

export type DeliveryPartnerNotificationCategory =
  | "TASK"
  | "PICKUP"
  | "DELIVERY"
  | "SCHEDULE"
  | "EARNINGS"
  | "REVIEW"
  | "SYSTEM";

export type NotificationPriority = "URGENT" | "HIGH" | "NORMAL";

export interface DeliveryPartnerNotification {
  id: string;
  partnerId: string;
  category: DeliveryPartnerNotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedOrderId?: string;
  relatedTaskId?: string;
}

export interface NotificationFilterParams {
  category?: "ALL" | DeliveryPartnerNotificationCategory;
  readStatus?: "ALL" | "UNREAD" | "READ";
  searchQuery?: string;
}

export type SupportCategory =
  | "PICKUP_ISSUE"
  | "DELIVERY_ISSUE"
  | "PAYMENT_EARNINGS"
  | "APP_TECHNICAL"
  | "SAFETY_EMERGENCY"
  | "OTHER";

export type SupportTicketStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";

export interface SupportMessage {
  id: string;
  senderType: "VALET_PARTNER" | "SUPPORT_OPERATIONS";
  senderName: string;
  message: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  partnerId: string;
  category: SupportCategory;
  priority: NotificationPriority;
  status: SupportTicketStatus;
  subject: string;
  description: string;
  relatedOrderId?: string;
  relatedTaskId?: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface CreateSupportTicketPayload {
  category: SupportCategory;
  priority: NotificationPriority;
  subject: string;
  description: string;
  relatedOrderId?: string;
  attachmentName?: string;
}

export interface ReplySupportTicketPayload {
  ticketId: string;
  message: string;
}

export interface SupportFaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export type NavigationAppPreference = "GOOGLE_MAPS" | "APPLE_MAPS" | "WAZE";
export type LanguagePreference = "en-IN" | "kn-IN" | "hi-IN";

export interface DeliveryPartnerPreferences {
  partnerId: string;
  navigationApp: NavigationAppPreference;
  language: LanguagePreference;
  audioChimeEnabled: boolean;
  autoAcceptPriorityOrders: boolean;
  highContrastMode: boolean;
  vibrationFeedback: boolean;
}

export interface DeliveryPartnerSecuritySettings {
  twoFactorAuthEnabled: boolean;
  biometricLoginEnabled: boolean;
  lastPasswordChanged: string;
}

export interface UpdatePreferencesPayload {
  navigationApp?: NavigationAppPreference;
  language?: LanguagePreference;
  audioChimeEnabled?: boolean;
  autoAcceptPriorityOrders?: boolean;
  highContrastMode?: boolean;
  vibrationFeedback?: boolean;
  twoFactorAuthEnabled?: boolean;
  biometricLoginEnabled?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeliveryPartnerDashboardSummary {
  activeDeliveriesCount: number;
  pendingPickupsCount: number;
  todayCompletedCount: number;
  todayEarningsAmount: number;
  todayTargetEarnings: number;
  shiftName: string;
  shiftTimeWindow: string;
  hubName: string;
  currentActiveTask: DeliveryPartnerTaskPreview | null;
  todayTaskQueue: DeliveryPartnerTaskPreview[];
  metrics: {
    onTimeRate: number;
    acceptanceRate: number;
    customerRating: number;
    totalTrips: number;
    weeklyDistanceKm: number;
  };
}

export interface DeliveryPartnerNavItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badgeCount?: number;
  isPhaseLocked?: boolean;
}

export interface DeliveryPartnerNavSection {
  title?: string;
  items: DeliveryPartnerNavItem[];
}
