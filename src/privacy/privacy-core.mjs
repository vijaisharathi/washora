/**
 * WASHORA Production Privacy & Data Governance Core Engine
 * Module: T10 — Privacy, Data Governance & Compliance Readiness
 * Author: Antigravity Senior Engineering Team
 * Standard: Aligned with India DPDPA 2023, GDPR Principles, and PCI-DSS Scope Minimization
 */

import { createHash, randomBytes } from 'crypto';

// ============================================================================
// 1. DATA CLASSIFICATION TIERS
// ============================================================================
export const DataClassification = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  SENSITIVE_PERSONAL_DATA: 'SENSITIVE_PERSONAL_DATA',
  HIGH_RISK_RESTRICTED: 'HIGH_RISK_RESTRICTED',
};

// ============================================================================
// 2. RETENTION CATEGORIES
// ============================================================================
export const RetentionCategory = {
  DELETABLE: 'DELETABLE',
  ANONYMIZABLE: 'ANONYMIZABLE',
  RETAINABLE: 'RETAINABLE', // Statutory/Financial record preservation
};

// ============================================================================
// 3. DATA INVENTORY ENGINE
// ============================================================================
export class DataInventoryEngine {
  constructor() {
    this.models = [
      { name: 'User', table: 'users', classification: DataClassification.SENSITIVE_PERSONAL_DATA, owner: 'Security & Auth', pii: true, fields: ['email', 'phone', 'fullName', 'passwordHash'] },
      { name: 'Session', table: 'sessions', classification: DataClassification.HIGH_RISK_RESTRICTED, owner: 'Security & Auth', pii: false, fields: ['token', 'ipAddress', 'userAgent', 'expiresAt'] },
      { name: 'EmailVerificationToken', table: 'email_verification_tokens', classification: DataClassification.HIGH_RISK_RESTRICTED, owner: 'Security & Auth', pii: false, fields: ['token', 'expiresAt'] },
      { name: 'PasswordResetToken', table: 'password_reset_tokens', classification: DataClassification.HIGH_RISK_RESTRICTED, owner: 'Security & Auth', pii: false, fields: ['token', 'expiresAt'] },
      { name: 'OrganizationMember', table: 'organization_members', classification: DataClassification.INTERNAL, owner: 'Operations', pii: false, fields: ['role', 'status'] },
      { name: 'Role', table: 'roles', classification: DataClassification.INTERNAL, owner: 'Operations', pii: false, fields: ['name', 'roleType'] },
      { name: 'Permission', table: 'permissions', classification: DataClassification.INTERNAL, owner: 'Operations', pii: false, fields: ['action', 'resource'] },
      { name: 'RolePermission', table: 'role_permissions', classification: DataClassification.INTERNAL, owner: 'Operations', pii: false, fields: ['roleId', 'permissionId'] },
      { name: 'Organization', table: 'organizations', classification: DataClassification.INTERNAL, owner: 'Platform Admin', pii: false, fields: ['name', 'slug', 'taxId', 'email', 'phone'] },
      { name: 'Customer', table: 'customers', classification: DataClassification.SENSITIVE_PERSONAL_DATA, owner: 'Customer Domain', pii: true, fields: ['membershipTier', 'preferences'] },
      { name: 'CustomerAddress', table: 'customer_addresses', classification: DataClassification.SENSITIVE_PERSONAL_DATA, owner: 'Customer Domain', pii: true, fields: ['streetAddress', 'latitude', 'longitude', 'postalCode', 'city'] },
      { name: 'CustomerFavorite', table: 'customer_favorites', classification: DataClassification.CONFIDENTIAL, owner: 'Customer Domain', pii: false, fields: ['serviceId', 'providerId'] },
      { name: 'CustomerRewardAccount', table: 'customer_reward_accounts', classification: DataClassification.CONFIDENTIAL, owner: 'Financial Domain', pii: false, fields: ['balance', 'tier'] },
      { name: 'CustomerRewardTransaction', table: 'customer_reward_transactions', classification: DataClassification.CONFIDENTIAL, owner: 'Financial Domain', pii: false, fields: ['points', 'type', 'reason'] },
      { name: 'Provider', table: 'providers', classification: DataClassification.CONFIDENTIAL, owner: 'Provider Operations', pii: true, fields: ['businessName', 'taxId', 'rating', 'verified'] },
      { name: 'ProviderServiceArea', table: 'provider_service_areas', classification: DataClassification.INTERNAL, owner: 'Provider Operations', pii: false, fields: ['postalCode', 'city'] },
      { name: 'ProviderService', table: 'provider_services', classification: DataClassification.PUBLIC, owner: 'Catalog Domain', pii: false, fields: ['customPrice', 'isActive'] },
      { name: 'ProviderAvailability', table: 'provider_availabilities', classification: DataClassification.INTERNAL, owner: 'Provider Operations', pii: false, fields: ['dayOfWeek', 'startTime', 'endTime'] },
      { name: 'ProviderDocument', table: 'provider_documents', classification: DataClassification.HIGH_RISK_RESTRICTED, owner: 'KYC & Compliance', pii: true, fields: ['documentType', 'documentNumber', 'fileUrl', 'verificationStatus'] },
      { name: 'DeliveryPartner', table: 'delivery_partners', classification: DataClassification.CONFIDENTIAL, owner: 'Logistics Domain', pii: true, fields: ['vehicleType', 'vehicleNumber', 'licenseNumber', 'rating'] },
      { name: 'DeliveryServiceArea', table: 'delivery_service_areas', classification: DataClassification.INTERNAL, owner: 'Logistics Domain', pii: false, fields: ['postalCode', 'city'] },
      { name: 'DeliveryAvailability', table: 'delivery_availabilities', classification: DataClassification.INTERNAL, owner: 'Logistics Domain', pii: false, fields: ['dayOfWeek', 'startTime', 'endTime'] },
      { name: 'DeliveryDocument', table: 'delivery_documents', classification: DataClassification.HIGH_RISK_RESTRICTED, owner: 'KYC & Compliance', pii: true, fields: ['documentType', 'fileUrl', 'verificationStatus'] },
      { name: 'ServiceCategory', table: 'service_categories', classification: DataClassification.PUBLIC, owner: 'Catalog Domain', pii: false, fields: ['name', 'slug', 'description', 'imageUrl'] },
      { name: 'Service', table: 'services', classification: DataClassification.PUBLIC, owner: 'Catalog Domain', pii: false, fields: ['name', 'basePrice', 'description'] },
      { name: 'ServiceVariant', table: 'service_variants', classification: DataClassification.PUBLIC, owner: 'Catalog Domain', pii: false, fields: ['name', 'priceDelta'] },
      { name: 'ServiceImage', table: 'service_images', classification: DataClassification.PUBLIC, owner: 'Catalog Domain', pii: false, fields: ['url', 'altText'] },
      { name: 'Booking', table: 'bookings', classification: DataClassification.CONFIDENTIAL, owner: 'Booking Domain', pii: true, fields: ['bookingNumber', 'status', 'totalPrice', 'notes'] },
      { name: 'BookingItem', table: 'booking_items', classification: DataClassification.CONFIDENTIAL, owner: 'Booking Domain', pii: false, fields: ['quantity', 'unitPrice', 'serviceName'] },
      { name: 'BookingAddress', table: 'booking_addresses', classification: DataClassification.SENSITIVE_PERSONAL_DATA, owner: 'Logistics Domain', pii: true, fields: ['streetAddress', 'latitude', 'longitude', 'contactPhone', 'contactName'] },
      { name: 'BookingSchedule', table: 'booking_schedules', classification: DataClassification.CONFIDENTIAL, owner: 'Booking Domain', pii: false, fields: ['pickupTime', 'deliveryTime'] },
      { name: 'PickupSlot', table: 'pickup_slots', classification: DataClassification.INTERNAL, owner: 'Booking Domain', pii: false, fields: ['startTime', 'endTime', 'capacity'] },
      { name: 'BookingStatusHistory', table: 'booking_status_histories', classification: DataClassification.INTERNAL, owner: 'Booking Domain', pii: false, fields: ['status', 'changedBy', 'reason'] },
      { name: 'BookingNote', table: 'booking_notes', classification: DataClassification.CONFIDENTIAL, owner: 'Operations', pii: false, fields: ['note', 'isInternal'] },
      { name: 'BookingAssignment', table: 'booking_assignments', classification: DataClassification.CONFIDENTIAL, owner: 'Logistics Domain', pii: false, fields: ['assignedPartnerId', 'status'] },
      { name: 'AssignmentHistory', table: 'assignment_histories', classification: DataClassification.INTERNAL, owner: 'Logistics Domain', pii: false, fields: ['partnerId', 'action', 'reason'] },
      { name: 'DeliveryEvent', table: 'delivery_events', classification: DataClassification.CONFIDENTIAL, owner: 'Logistics Domain', pii: false, fields: ['eventType', 'locationLat', 'locationLng', 'proofUrl'] },
      { name: 'Payment', table: 'payments', classification: DataClassification.CONFIDENTIAL, owner: 'Financial Domain', pii: true, fields: ['amount', 'currency', 'status', 'paymentMethod', 'gatewayTransactionId'] },
      { name: 'Transaction', table: 'transactions', classification: DataClassification.CONFIDENTIAL, owner: 'Financial Domain', pii: false, fields: ['amount', 'type', 'balanceAfter'] },
      { name: 'Earning', table: 'earnings', classification: DataClassification.CONFIDENTIAL, owner: 'Financial Domain', pii: false, fields: ['netAmount', 'commissionAmount', 'payoutStatus'] },
      { name: 'EarningTransaction', table: 'earning_transactions', classification: DataClassification.CONFIDENTIAL, owner: 'Financial Domain', pii: false, fields: ['amount', 'type'] },
      { name: 'Refund', table: 'refunds', classification: DataClassification.CONFIDENTIAL, owner: 'Financial Domain', pii: false, fields: ['amount', 'reason', 'status', 'gatewayRefundId'] },
      { name: 'Coupon', table: 'coupons', classification: DataClassification.PUBLIC, owner: 'Marketing Domain', pii: false, fields: ['code', 'discountPercent', 'validUntil'] },
      { name: 'CouponRedemption', table: 'coupon_redemptions', classification: DataClassification.CONFIDENTIAL, owner: 'Marketing Domain', pii: false, fields: ['userId', 'couponId'] },
      { name: 'PromotionalOffer', table: 'promotional_offers', classification: DataClassification.PUBLIC, owner: 'Marketing Domain', pii: false, fields: ['title', 'discountAmount'] },
      { name: 'OfferRedemption', table: 'offer_redemptions', classification: DataClassification.CONFIDENTIAL, owner: 'Marketing Domain', pii: false, fields: ['userId', 'offerId'] },
      { name: 'Review', table: 'reviews', classification: DataClassification.PUBLIC, owner: 'Review Domain', pii: true, fields: ['rating', 'comment', 'authorName'] },
      { name: 'ReviewModerationHistory', table: 'review_moderation_histories', classification: DataClassification.INTERNAL, owner: 'Operations', pii: false, fields: ['status', 'moderatorId', 'notes'] },
      { name: 'ReviewResponse', table: 'review_responses', classification: DataClassification.PUBLIC, owner: 'Provider Operations', pii: false, fields: ['response'] },
      { name: 'ReviewReport', table: 'review_reports', classification: DataClassification.CONFIDENTIAL, owner: 'Operations', pii: false, fields: ['reason', 'reportedBy'] },
      { name: 'Notification', table: 'notifications', classification: DataClassification.CONFIDENTIAL, owner: 'Communication', pii: true, fields: ['title', 'body', 'channel', 'readAt'] },
      { name: 'NotificationPreference', table: 'notification_preferences', classification: DataClassification.CONFIDENTIAL, owner: 'Customer Domain', pii: false, fields: ['emailEnabled', 'smsEnabled', 'marketingOptIn'] },
      { name: 'NotificationTemplate', table: 'notification_templates', classification: DataClassification.INTERNAL, owner: 'Communication', pii: false, fields: ['code', 'template'] },
      { name: 'Communication', table: 'communications', classification: DataClassification.CONFIDENTIAL, owner: 'Communication', pii: true, fields: ['subject', 'body', 'channel'] },
      { name: 'CommunicationRecipient', table: 'communication_recipients', classification: DataClassification.SENSITIVE_PERSONAL_DATA, owner: 'Communication', pii: true, fields: ['recipientAddress', 'status'] },
      { name: 'NotificationEventLog', table: 'notification_event_logs', classification: DataClassification.INTERNAL, owner: 'Communication', pii: false, fields: ['event', 'providerResponse'] },
      { name: 'SupportTicket', table: 'support_tickets', classification: DataClassification.CONFIDENTIAL, owner: 'Support Domain', pii: true, fields: ['ticketNumber', 'subject', 'priority', 'status'] },
      { name: 'SupportMessage', table: 'support_messages', classification: DataClassification.CONFIDENTIAL, owner: 'Support Domain', pii: true, fields: ['message', 'attachmentUrl'] },
      { name: 'SupportNote', table: 'support_notes', classification: DataClassification.INTERNAL, owner: 'Support Domain', pii: false, fields: ['internalNote'] },
      { name: 'SupportTicketActivity', table: 'support_ticket_activities', classification: DataClassification.INTERNAL, owner: 'Support Domain', pii: false, fields: ['action', 'performedBy'] },
      { name: 'Dispute', table: 'disputes', classification: DataClassification.CONFIDENTIAL, owner: 'Dispute & Trust', pii: true, fields: ['disputeNumber', 'reason', 'claimAmount', 'status'] },
      { name: 'DisputeMessage', table: 'dispute_messages', classification: DataClassification.CONFIDENTIAL, owner: 'Dispute & Trust', pii: true, fields: ['message'] },
      { name: 'DisputeEvidence', table: 'dispute_evidences', classification: DataClassification.HIGH_RISK_RESTRICTED, owner: 'Dispute & Trust', pii: true, fields: ['fileUrl', 'description', 'uploadedBy'] },
      { name: 'DisputeActivity', table: 'dispute_activities', classification: DataClassification.INTERNAL, owner: 'Dispute & Trust', pii: false, fields: ['action', 'details'] },
      { name: 'AuditEvent', table: 'audit_events', classification: DataClassification.INTERNAL, owner: 'Security & Compliance', pii: false, fields: ['actorId', 'action', 'resource', 'ipAddress', 'userAgent'] },
      { name: 'AnalyticsEvent', table: 'analytics_events', classification: DataClassification.INTERNAL, owner: 'Analytics & Product', pii: false, fields: ['eventName', 'eventCategory', 'properties'] },
      { name: 'Experiment', table: 'experiments', classification: DataClassification.INTERNAL, owner: 'Analytics & Product', pii: false, fields: ['key', 'name', 'hypothesis'] },
      { name: 'ExperimentVariant', table: 'experiment_variants', classification: DataClassification.INTERNAL, owner: 'Analytics & Product', pii: false, fields: ['key', 'name', 'trafficAllocation'] },
      { name: 'ExperimentAssignment', table: 'experiment_assignments', classification: DataClassification.INTERNAL, owner: 'Analytics & Product', pii: false, fields: ['variantId', 'assignedAt'] },
      { name: 'ProductImprovement', table: 'product_improvements', classification: DataClassification.INTERNAL, owner: 'Analytics & Product', pii: false, fields: ['title', 'problem', 'hypothesis'] }
    ];
  }

  getInventory() {
    return this.models;
  }

  getSummary() {
    const totalModels = this.models.length;
    const piiModels = this.models.filter(m => m.pii).length;
    const byClassification = this.models.reduce((acc, curr) => {
      acc[curr.classification] = (acc[curr.classification] || 0) + 1;
      return acc;
    }, {});
    return {
      totalModels,
      piiModels,
      byClassification,
      timestamp: new Date().toISOString()
    };
  }

  findModel(name) {
    return this.models.find(m => m.name.toLowerCase() === name.toLowerCase());
  }
}

// ============================================================================
// 4. DATA CLASSIFICATION ENGINE
// ============================================================================
export class DataClassificationEngine {
  constructor() {
    this.rules = [
      {
        tier: DataClassification.PUBLIC,
        description: 'Information intentionally made accessible to all visitors without authentication.',
        examples: ['Service catalog pricing and descriptions', 'Service images', 'Provider business name and public rating', 'Published reviews without personal email/phone'],
        controls: ['CDN edge caching', 'Public read access', 'Integrity protection against defacement']
      },
      {
        tier: DataClassification.INTERNAL,
        description: 'Operational information for platform functioning not intended for public access.',
        examples: ['Roles and permissions matrices', 'System performance metrics', 'Notification templates', 'Internal moderation notes', 'Service variant IDs'],
        controls: ['Authenticated employee/service access', 'Audit logging on configuration changes', 'Strict authorization middleware']
      },
      {
        tier: DataClassification.CONFIDENTIAL,
        description: 'Customer or provider transactional records requiring strictly scoped access.',
        examples: ['Booking schedules and order item breakdown', 'Reward balances', 'Provider earnings and commissions', 'Support ticket metadata', 'Dispute claim statuses'],
        controls: ['Role-based access control (RBAC)', 'Multi-tenant organization partitioning', 'TLS in transit and AES-256 at rest']
      },
      {
        tier: DataClassification.SENSITIVE_PERSONAL_DATA,
        description: 'Directly identifiable customer, provider, or delivery partner personal information.',
        examples: ['Customer full name', 'Personal email addresses', 'Phone numbers', 'Physical residential pickup addresses (lat/lng, street)', 'Communication recipient addresses'],
        controls: ['Least-privilege operational access', 'Masking in admin/operational views', 'Redaction in application logs and traces', 'Right to erasure/anonymization readiness']
      },
      {
        tier: DataClassification.HIGH_RISK_RESTRICTED,
        description: 'Critical credentials, tokens, KYC government documents, and financial transaction references.',
        examples: ['Argon2id password hashes', 'Session & refresh tokens', 'Provider Aadhaar/PAN/Driving License scans', 'Dispute evidence photos', 'Payment gateway transaction secrets'],
        controls: ['Zero plain credential logging', 'Private cloud object storage with 15-min signed URLs', 'Zero card PAN/CVV storage (strict tokenization)', 'Strict rate limiting and tamper-proof audit trails']
      }
    ];
  }

  classifyField(fieldName, context = '') {
    const lower = fieldName.toLowerCase();
    if (lower.includes('password') || lower.includes('token') || lower.includes('secret') || lower.includes('kyc') || lower.includes('documentnumber') || lower.includes('license')) {
      return DataClassification.HIGH_RISK_RESTRICTED;
    }
    if (lower.includes('email') || lower.includes('phone') || lower.includes('street') || lower.includes('address') || lower.includes('lat') || lower.includes('lng')) {
      return DataClassification.SENSITIVE_PERSONAL_DATA;
    }
    if (lower.includes('amount') || lower.includes('earning') || lower.includes('balance') || lower.includes('booking') || lower.includes('dispute') || lower.includes('ticket')) {
      return DataClassification.CONFIDENTIAL;
    }
    if (lower.includes('service') || lower.includes('category') || lower.includes('image') || lower.includes('coupon')) {
      return DataClassification.PUBLIC;
    }
    return DataClassification.INTERNAL;
  }

  getTiers() {
    return this.rules;
  }
}

// ============================================================================
// 5. DATA FLOW MAPPING ENGINE
// ============================================================================
export class DataFlowMappingEngine {
  constructor() {
    this.flows = [
      {
        flowName: 'Customer Registration & Authentication',
        source: 'Customer Web/Mobile Frontend',
        entryPoint: '/api/auth/register, /api/auth/login',
        dataItems: ['Full Name', 'Email', 'Phone', 'Password (Plaintext in transit)'],
        processingSteps: [
          'Client submits TLS 1.3 encrypted payload',
          'API Gateway enforces rate limits and validates DTO schema',
          'AuthService hashes password with Argon2id',
          'User record stored in PostgreSQL `users` table',
          'Verification token generated with crypto.randomBytes',
          'Notification service enqueues welcome/verification email via SendGrid',
          'Session cookie established with Secure, HttpOnly, SameSite=Strict'
        ],
        destination: 'PostgreSQL, SendGrid, Redis Session Cache',
        piiPresent: true
      },
      {
        flowName: 'Service Discovery & Catalog Browsing',
        source: 'Public Web Frontend',
        entryPoint: '/api/catalog/categories, /api/catalog/services',
        dataItems: ['Category Names', 'Service Descriptions', 'Base Prices', 'Images'],
        processingSteps: [
          'Public unauthenticated GET request',
          'CDN edge cache checked',
          'Catalog service queries read-replica DB',
          'Sanitized JSON returned to frontend'
        ],
        destination: 'Cloudflare CDN, Browser DOM',
        piiPresent: false
      },
      {
        flowName: 'Booking Creation & Pickup Scheduling',
        source: 'Authenticated Customer App',
        entryPoint: '/api/bookings',
        dataItems: ['Customer ID', 'Pickup Address', 'Service Items', 'Selected Slot', 'Contact Phone'],
        processingSteps: [
          'JWT authentication verified',
          'Customer ownership of address verified (IDOR defense)',
          'BookingAddress snapshot created in PostgreSQL',
          'Booking record created with PENDING status',
          'Operations assignment engine evaluated',
          'Notification dispatched to assigned Provider & Delivery Partner'
        ],
        destination: 'PostgreSQL `bookings`, `booking_addresses`, Twilio SMS',
        piiPresent: true
      },
      {
        flowName: 'Payment Intent & Checkout Processing',
        source: 'Customer App & Payment Gateway SDK',
        entryPoint: '/api/payments/intent, /api/payments/webhook',
        dataItems: ['Booking ID', 'Amount', 'Currency', 'Payment Method Token (Stripe/Razorpay)'],
        processingSteps: [
          'Backend initiates PaymentIntent with external gateway over TLS',
          'Client collects card/UPI securely in PCI-DSS compliant iframe/SDK',
          'WASHORA receives only payment intent token and metadata',
          'Webhook confirms payment success with cryptographic signature check',
          'Financial ledger updated with Payment and Transaction records',
          'Zero PAN or CVV touches WASHORA database or application servers'
        ],
        destination: 'Stripe / Razorpay, PostgreSQL `payments`, `transactions`',
        piiPresent: false // ZERO sensitive cardholder PAN/CVV stored
      },
      {
        flowName: 'Provider KYC & Identity Verification',
        source: 'Provider Onboarding Portal',
        entryPoint: '/api/provider/documents/upload',
        dataItems: ['Provider ID', 'Document Type (Aadhaar/PAN/License)', 'Document Number', 'Document Image/PDF'],
        processingSteps: [
          'Provider authenticated and authorized',
          'Backend generates short-lived (15-min) presigned S3 upload URL',
          'Client uploads encrypted file directly to private S3 bucket',
          'Metadata stored in PostgreSQL `provider_documents` with PENDING status',
          'KYC Compliance Officer reviews document via expiring signed URL',
          'Verification status updated; document access restricted by RBAC'
        ],
        destination: 'Private AWS S3 Bucket, PostgreSQL `provider_documents`',
        piiPresent: true
      },
      {
        flowName: 'Delivery Logistics & Route Fulfillment',
        source: 'Delivery Partner Mobile App',
        entryPoint: '/api/delivery/active-trip, /api/delivery/events',
        dataItems: ['Delivery Partner ID', 'Pickup Location', 'Masked Customer Phone', 'Dropoff Coordinates'],
        processingSteps: [
          'Delivery partner authenticated; verified for assigned job',
          'API returns operational address and masked contact proxy',
          'Partner reports GPS coordinate ping during transit',
          'Delivery proof photo uploaded to private S3 bucket',
          'Trip completed; customer access token to delivery tracking expires'
        ],
        destination: 'PostgreSQL `delivery_events`, S3 Proofs, Google Maps Directions',
        piiPresent: true
      }
    ];
  }

  getFlows() {
    return this.flows;
  }
}

// ============================================================================
// 6. PURPOSE LIMITATION ENGINE
// ============================================================================
export class PurposeLimitationEngine {
  constructor() {
    this.purposeMappings = [
      {
        dataCategory: 'Account & Identity',
        fields: ['fullName', 'email', 'passwordHash'],
        purpose: 'User authentication, account security, and service communications.',
        lawfulBasisCandidate: 'Contract Performance / Legitimate Interest',
        owner: 'Security & Auth',
        minimized: true
      },
      {
        dataCategory: 'Contact Details',
        fields: ['phone'],
        purpose: 'Two-factor security challenges and urgent pickup/delivery notifications.',
        lawfulBasisCandidate: 'Contract Performance',
        owner: 'Customer Domain',
        minimized: true
      },
      {
        dataCategory: 'Physical Location',
        fields: ['streetAddress', 'postalCode', 'latitude', 'longitude'],
        purpose: 'Physical laundry collection, washing route planning, and dropoff fulfillment.',
        lawfulBasisCandidate: 'Contract Performance',
        owner: 'Logistics Domain',
        minimized: true
      },
      {
        dataCategory: 'Provider Verification',
        fields: ['documentType', 'documentNumber', 'documentUrl'],
        purpose: 'Platform trust & safety, provider vetting, and statutory identity verification.',
        lawfulBasisCandidate: 'Legal Obligation / Legitimate Interest',
        owner: 'KYC & Compliance',
        minimized: true
      },
      {
        dataCategory: 'Financial Records',
        fields: ['amount', 'currency', 'gatewayTransactionId', 'paymentMethodType', 'last4'],
        purpose: 'Order billing, refund processing, statutory tax invoicing, and merchant settlement.',
        lawfulBasisCandidate: 'Legal & Accounting Obligation',
        owner: 'Financial Domain',
        minimized: true
      },
      {
        dataCategory: 'Customer Support & Disputes',
        fields: ['ticketSubject', 'messages', 'disputeEvidencePhotos'],
        purpose: 'Resolution of lost/damaged item claims, customer inquiries, and quality audits.',
        lawfulBasisCandidate: 'Contract Performance / Legitimate Interest',
        owner: 'Support & Trust',
        minimized: true
      }
    ];
  }

  getPurposeMappings() {
    return this.purposeMappings;
  }

  validateFieldPurpose(fieldName) {
    const lower = fieldName.toLowerCase();
    for (const mapping of this.purposeMappings) {
      if (mapping.fields.some(f => lower.includes(f.toLowerCase()))) {
        return { valid: true, purpose: mapping.purpose, category: mapping.dataCategory };
      }
    }
    return { valid: false, reason: 'Field does not map to an approved operational purpose' };
  }
}

// ============================================================================
// 7. ACCESS CONTROL & TENANT ISOLATION ENGINE
// ============================================================================
export class AccessControlIsolationEngine {
  verifyCustomerAccess(requestingUserId, targetResourceUserId) {
    return requestingUserId === targetResourceUserId;
  }

  verifyTenantAccess(requestingOrgId, targetResourceOrgId) {
    if (!requestingOrgId || !targetResourceOrgId) return false;
    return requestingOrgId === targetResourceOrgId;
  }

  sanitizeCustomerForProvider(customer) {
    // Provider needs to know customer name for order package labeling,
    // but customer phone and email must be masked to prevent out-of-band solicitation
    return {
      id: customer.id,
      name: customer.name,
      maskedPhone: customer.phone ? customer.phone.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1-XXXXX-$3') : null,
      maskedEmail: customer.email ? customer.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null
    };
  }

  sanitizeCustomerForDelivery(customer, bookingAddress) {
    // Delivery partner needs precise delivery address and proxy contact, but never payment or profile history
    return {
      recipientName: bookingAddress.contactName || customer.name,
      deliveryAddress: bookingAddress.streetAddress,
      city: bookingAddress.city,
      postalCode: bookingAddress.postalCode,
      maskedPhone: bookingAddress.contactPhone ? bookingAddress.contactPhone.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1-XXXXX-$3') : null
    };
  }
}

// ============================================================================
// 8. PAYMENT DATA BOUNDARY ENGINE (PCI-DSS MINIMIZATION)
// ============================================================================
export class PaymentBoundaryEngine {
  isPciCompliantBoundary(record) {
    const keys = Object.keys(record);
    const prohibited = ['cardnumber', 'pan', 'cvv', 'cvc', 'securitycode', 'card_number', 'credit_card', 'pin'];
    for (const key of keys) {
      const lower = key.toLowerCase();
      for (const p of prohibited) {
        if (lower.includes(p)) {
          return { compliant: false, violationField: key };
        }
      }
    }
    return { compliant: true };
  }

  sanitizePaymentMetadata(rawGatewayResponse) {
    return {
      paymentId: rawGatewayResponse.id,
      amount: rawGatewayResponse.amount,
      currency: rawGatewayResponse.currency,
      status: rawGatewayResponse.status,
      paymentMethodType: rawGatewayResponse.payment_method_types?.[0] || 'card',
      last4: rawGatewayResponse.charges?.data?.[0]?.payment_method_details?.card?.last4 || rawGatewayResponse.last4 || '****',
      cardBrand: rawGatewayResponse.charges?.data?.[0]?.payment_method_details?.card?.brand || 'VISA/MC',
      gatewayTransactionId: rawGatewayResponse.id
    };
  }
}

// ============================================================================
// 9. LOG & TRACE SANITIZER ENGINE
// ============================================================================
export class LogTraceSanitizerEngine {
  sanitizeText(text) {
    if (!text || typeof text !== 'string') return text;
    let sanitized = text;

    // Redact 16-digit credit card PANs
    sanitized = sanitized.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_CARD_PAN]');

    // Redact 3-4 digit CVV/CVC
    sanitized = sanitized.replace(/(?:cvv|cvc|security_code)[:=]\s*\d{3,4}/gi, 'cvv=[REDACTED_CVV]');

    // Redact email addresses
    sanitized = sanitized.replace(/([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g, (match, user, domain) => {
      if (user.length <= 2) return `${user[0]}***@${domain}`;
      return `${user[0]}***${user[user.length - 1]}@${domain}`;
    });

    // Redact 10-12 digit phone numbers
    sanitized = sanitized.replace(/(?:\+91|0)?[6-9]\d{9}/g, (match) => {
      return match.slice(0, 3) + '-XXXXX-' + match.slice(-2);
    });

    // Redact Authorization headers and Bearer tokens
    sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [REDACTED_TOKEN]');

    // Redact passwords and secrets
    sanitized = sanitized.replace(/(password|secret|apiKey|api_key|token)["':=\s]+([^,\s}"]+)/gi, '$1="[REDACTED]"');

    return sanitized;
  }

  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      if (lower.includes('password') || lower.includes('secret') || lower.includes('token') || lower.includes('cvv')) {
        result[key] = '[REDACTED]';
      } else if (lower.includes('email') && typeof value === 'string') {
        result[key] = this.sanitizeText(value);
      } else if (lower.includes('phone') && typeof value === 'string') {
        result[key] = this.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.sanitizeObject(value);
      } else if (typeof value === 'string') {
        result[key] = this.sanitizeText(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}

// ============================================================================
// 10. THIRD-PARTY SHARING INVENTORY ENGINE
// ============================================================================
export class ThirdPartySharingEngine {
  constructor() {
    this.processors = [
      {
        provider: 'Stripe Inc.',
        purpose: 'Credit Card & International Payment Processing',
        dataShared: ['Payment Amount', 'Currency', 'Customer Email (for receipt)', 'Payment Intent ID'],
        protection: 'TLS 1.3, PCI-DSS Level 1 Hosted Tokenization',
        location: 'United States / EU (Cross-border transfer requires Legal Review)',
        minimizationCompliant: true
      },
      {
        provider: 'Razorpay Software Pvt Ltd',
        purpose: 'UPI, NetBanking & Domestic Indian Payment Processing',
        dataShared: ['Transaction Amount', 'Currency', 'Order ID', 'Customer Phone (for OTP)'],
        protection: 'TLS 1.3, RBI Payment Aggregator Guidelines, ISO 27001',
        location: 'India',
        minimizationCompliant: true
      },
      {
        provider: 'Twilio Inc. / Gupshup',
        purpose: 'Transactional SMS & WhatsApp Pickup Notifications',
        dataShared: ['Masked Phone Number', 'Booking Reference Number', 'Short Status Message'],
        protection: 'HTTPS API, SOC2 Type II',
        location: 'Global / India localized gateways',
        minimizationCompliant: true
      },
      {
        provider: 'SendGrid / Twilio SendGrid',
        purpose: 'Transactional Account & Verification Emails',
        dataShared: ['Recipient Email', 'Recipient First Name', 'Transactional Email Template Data'],
        protection: 'TLS in transit, DKIM/SPF authenticated, SOC2',
        location: 'United States / EU',
        minimizationCompliant: true
      },
      {
        provider: 'Amazon Web Services (AWS S3 & CloudFront)',
        purpose: 'Encrypted Cloud Storage for KYC & Dispute Evidence',
        dataShared: ['Encrypted KYC Files', 'Dispute Proof Photos'],
        protection: 'Server-Side Encryption (SSE-S3/KMS), Private Buckets, 15-Minute Expiring Presigned URLs',
        location: 'AWS ap-south-1 (Mumbai, India)',
        minimizationCompliant: true
      },
      {
        provider: 'Google Maps Platform',
        purpose: 'Address Autocomplete & Route Optimization for Delivery Fleet',
        dataShared: ['Pickup and Delivery Lat/Lng Coordinates', 'Postal Code'],
        protection: 'Restricted API Keys with Domain & IP Whitelisting',
        location: 'Global Cloud (Google Infrastructure)',
        minimizationCompliant: true // ZERO customer names, emails, or phone numbers shared
      },
      {
        provider: 'Datadog / OpenTelemetry Collector',
        purpose: 'Application Performance Monitoring, Traces & Error Telemetry',
        dataShared: ['Aggregated Latencies', 'Error Stack Traces (Scrubbed of PII)', 'HTTP Status Codes'],
        protection: 'TLS 1.3, In-agent Log Scrubber rules',
        location: 'EU/US (Data Scrubbing filters enabled)',
        minimizationCompliant: true
      }
    ];
  }

  getProcessors() {
    return this.processors;
  }
}

// ============================================================================
// 11. RETENTION AND DELETION ENGINE
// ============================================================================
export class RetentionAndDeletionEngine {
  constructor() {
    this.matrix = [
      {
        domain: 'Account & Profile',
        table: 'users, customers',
        purpose: 'Customer identity and account management',
        retentionCategory: RetentionCategory.ANONYMIZABLE,
        standardPeriod: 'Active account duration + 30 days post deactivation',
        approvalStatus: 'APPROVED'
      },
      {
        domain: 'Addresses',
        table: 'customer_addresses',
        purpose: 'Pickup & dropoff location saving',
        retentionCategory: RetentionCategory.DELETABLE,
        standardPeriod: 'Immediately upon user deletion request',
        approvalStatus: 'APPROVED'
      },
      {
        domain: 'Bookings & Orders',
        table: 'bookings, booking_items',
        purpose: 'Order fulfillment and transaction history',
        retentionCategory: RetentionCategory.ANONYMIZABLE,
        standardPeriod: '3 years after completion for operational warranty',
        approvalStatus: 'REQUIRES APPROVAL'
      },
      {
        domain: 'Financial & Invoices',
        table: 'payments, transactions, refunds, earnings',
        purpose: 'Statutory accounting, tax audits (GST), and financial reporting',
        retentionCategory: RetentionCategory.RETAINABLE,
        standardPeriod: '8 years (Section 128, Indian Companies Act 2013)',
        approvalStatus: 'APPROVED (Statutory Requirement)'
      },
      {
        domain: 'KYC & Identity Documents',
        table: 'provider_documents, delivery_documents',
        purpose: 'Partner onboarding verification and regulatory diligence',
        retentionCategory: RetentionCategory.ANONYMIZABLE,
        standardPeriod: 'Active partner tenure + 5 years post termination',
        approvalStatus: 'REQUIRES APPROVAL'
      },
      {
        domain: 'Customer Reviews',
        table: 'reviews',
        purpose: 'Public marketplace transparency and quality feedback',
        retentionCategory: RetentionCategory.ANONYMIZABLE,
        standardPeriod: 'Retained with author anonymized to "Verified Customer"',
        approvalStatus: 'APPROVED'
      },
      {
        domain: 'Notifications & Communications',
        table: 'notifications, communications, event_logs',
        purpose: 'User messaging audit',
        retentionCategory: RetentionCategory.DELETABLE,
        standardPeriod: '90 days retention with automated lifecycle purge',
        approvalStatus: 'APPROVED'
      },
      {
        domain: 'Support & Disputes',
        table: 'support_tickets, disputes, evidences',
        purpose: 'Customer claim resolution and legal dispute defense',
        retentionCategory: RetentionCategory.ANONYMIZABLE,
        standardPeriod: '3 years after dispute closure',
        approvalStatus: 'REQUIRES APPROVAL'
      },
      {
        domain: 'Audit Logs',
        table: 'audit_events',
        purpose: 'Security auditing, forensic analysis, compliance proof',
        retentionCategory: RetentionCategory.RETAINABLE,
        standardPeriod: '1 year rolling retention in immutable storage',
        approvalStatus: 'APPROVED'
      },
      {
        domain: 'Database Backups',
        table: 'Encrypted S3 Backups',
        purpose: 'Disaster recovery and business continuity (T4)',
        retentionCategory: RetentionCategory.DELETABLE,
        standardPeriod: '35 days automated lifecycle expiration',
        approvalStatus: 'APPROVED'
      }
    ];
  }

  getRetentionMatrix() {
    return this.matrix;
  }

  generateUserDataExport(user, customer, addresses, bookings, reviews, tickets) {
    // Generates a comprehensive, authenticated JSON data export for the user
    return {
      exportMetadata: {
        requestId: randomBytes(16).toString('hex'),
        userId: user.id,
        exportedAt: new Date().toISOString(),
        format: 'JSON',
        version: '1.0.0',
        notice: 'This export contains your personal data processed by WASHORA under applicable data protection frameworks.'
      },
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        preferredLanguage: user.preferredLanguage || 'ENGLISH'
      },
      customerDetails: customer ? {
        membershipTier: customer.membershipTier,
        preferences: customer.preferences
      } : null,
      savedAddresses: addresses.map(a => ({
        label: a.label,
        streetAddress: a.streetAddress,
        city: a.city,
        postalCode: a.postalCode
      })),
      bookingHistory: bookings.map(b => ({
        bookingNumber: b.bookingNumber,
        status: b.status,
        totalPrice: b.totalPrice,
        createdAt: b.createdAt
      })),
      reviewsWritten: reviews.map(r => ({
        serviceName: r.serviceName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      })),
      supportTickets: tickets.map(t => ({
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        status: t.status,
        createdAt: t.createdAt
      }))
    };
  }

  anonymizeUserAccount(user) {
    // Hashes email and phone to retain uniqueness constraint without retaining PII
    const hash = createHash('sha256').update(user.id).digest('hex').slice(0, 12);
    return {
      id: user.id,
      fullName: 'Anonymized User',
      email: `anonymized_${hash}@washora.internal`,
      phone: `+9100000${hash.slice(0, 5)}`,
      passwordHash: '[ANONYMIZED_REVOKED_HASH]',
      status: 'INACTIVE',
      isAnonymized: true,
      anonymizedAt: new Date().toISOString()
    };
  }
}

// ============================================================================
// 12. PRIVACY INCIDENT RESPONSE ENGINE
// ============================================================================
export class PrivacyIncidentEngine {
  constructor() {
    this.workflow = [
      { step: 1, name: 'Detect', action: 'Incident detected via automated alerts, security monitoring, or user/partner report.' },
      { step: 2, name: 'Contain', action: 'Isolate compromised endpoint, revoke active session tokens, rotate API keys, or disable affected service.' },
      { step: 3, name: 'Preserve Evidence', action: 'Capture snapshot of logs, database transaction logs, and network telemetry in tamper-evident storage.' },
      { step: 4, name: 'Assess Data', action: 'Identify specific data categories, models, and personal fields exposed (Public vs Sensitive vs High-Risk).' },
      { step: 5, name: 'Identify Affected Users', action: 'Query audit logs and database access records to identify precise list of impacted tenant and user IDs.' },
      { step: 6, name: 'Determine Severity', action: 'Calculate incident severity level (P0 Critical, P1 High, P2 Medium, P3 Low) using triage matrix.' },
      { step: 7, name: 'Legal & Compliance Review', action: 'Convene Legal Counsel & Data Protection Officer to assess statutory notification duties.' },
      { step: 8, name: 'Required Notification', action: 'Notify data protection authorities (CERT-In / DPDPA / GDPR) within required statutory timelines if applicable.' },
      { step: 9, name: 'Remediation', action: 'Deploy permanent code/configuration fix, patch vulnerability, and invalidate any leaked tokens.' },
      { step: 10, name: 'Post-Incident Review', action: 'Publish formal Root Cause Analysis (RCA), update runbooks, and verify preventive controls.' }
    ];
  }

  getWorkflow() {
    return this.workflow;
  }

  calculateSeverity(params) {
    const { sensitiveDataExposed, credentialsLeaked, affectedUsersCount, exposureDurationHours } = params;
    if (credentialsLeaked || (sensitiveDataExposed && affectedUsersCount > 1000)) {
      return { level: 'P0_CRITICAL', notifyAuthorities: true, timeline: 'Immediate (within 6 hours)' };
    }
    if (sensitiveDataExposed || affectedUsersCount > 100 || exposureDurationHours > 24) {
      return { level: 'P1_HIGH', notifyAuthorities: true, timeline: 'Within 24-72 hours subject to legal counsel' };
    }
    if (affectedUsersCount > 10) {
      return { level: 'P2_MEDIUM', notifyAuthorities: false, timeline: 'Internal remediation within 5 business days' };
    }
    return { level: 'P3_LOW', notifyAuthorities: false, timeline: 'Standard operational backlog fix' };
  }
}
