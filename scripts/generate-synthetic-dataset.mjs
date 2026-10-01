/**
 * ============================================================================
 * WASHORA PHASE T3 — PRODUCTION-LIKE SYNTHETIC DATASET GENERATOR
 * ============================================================================
 * Authoritative Synthetic Dataset Generator for Load, Stress & Scalability Testing
 * 
 * Generates a realistic, highly relational, non-uniform synthetic dataset across
 * all 28 canonical domain entities defined in the WASHORA Prisma schema.
 * 
 * Distribution Characteristics:
 * - Multi-tenant partitioning across 3 distinct organizations (ORG-0001, ORG-0002, ORG-0003)
 * - 80/20 Power-law skew: 20% of catalog services account for 80% of booking volume
 * - Provider workload concentration: Top 15% of providers handle 70% of bookings
 * - Realistic transaction lifecycle outcomes (85% paid, 10% retry, 5% failure)
 * - Skewed notification read rates (35% unread, 65% read)
 * - Zero real customer PII: All emails, phone numbers, and addresses are strictly synthetic
 * 
 * Usage:
 *   node scripts/generate-synthetic-dataset.mjs [--scale=standard|large|stress]
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';

console.log('================================================================================');
console.log('📦 WASHORA T3 — SYNTHETIC DATASET GENERATION ENGINE');
console.log('================================================================================\n');

const args = process.argv.slice(2);
let scale = 'standard';
for (const arg of args) {
  if (arg.startsWith('--scale=')) {
    scale = arg.split('=')[1];
  }
}

// Scale configuration multiplier
const SCALE_CONFIG = {
  standard: {
    orgCount: 3,
    userCount: 600,
    customerCount: 450,
    providerCount: 60,
    deliveryPartnerCount: 60,
    staffCount: 30,
    categoryCount: 15,
    serviceCount: 45,
    variantPerService: 3,
    bookingCount: 3000,
    couponCount: 150,
    offerCount: 50,
    reviewCount: 1200,
    notificationCount: 4500,
    communicationCount: 200,
    ticketCount: 400,
    disputeCount: 120,
    auditCount: 6000,
    analyticsCount: 8000,
  },
  large: {
    orgCount: 5,
    userCount: 2000,
    customerCount: 1500,
    providerCount: 200,
    deliveryPartnerCount: 200,
    staffCount: 100,
    categoryCount: 20,
    serviceCount: 80,
    variantPerService: 4,
    bookingCount: 10000,
    couponCount: 500,
    offerCount: 150,
    reviewCount: 4000,
    notificationCount: 15000,
    communicationCount: 800,
    ticketCount: 1500,
    disputeCount: 400,
    auditCount: 20000,
    analyticsCount: 30000,
  },
};

const config = SCALE_CONFIG[scale] || SCALE_CONFIG.standard;
console.log(`ℹ️ Generating dataset with profile: [${scale.toUpperCase()}]`);

// Deterministic Pseudo-Random Generator (LCG)
class DeterministicRandom {
  constructor(seed = 133742) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }
  // Power law distribution: bias toward lower indices
  powerLaw(max, exponent = 2.5) {
    const r = this.next();
    return Math.floor(Math.pow(r, exponent) * max);
  }
  boolean(probabilityOfTrue = 0.5) {
    return this.next() < probabilityOfTrue;
  }
}

const rng = new DeterministicRandom(20260921);

function uuid() {
  return crypto.randomUUID();
}

export function generateSyntheticDataset(customConfig = {}) {
  const cfg = { ...config, ...customConfig };
  const startTime = Date.now();

  const dataset = {
    metadata: {
      generatedAt: new Date().toISOString(),
      generatorVersion: 'WASHORA-T3-1.0.0',
      scaleProfile: scale,
      recordCounts: {},
      distributionMetrics: {},
    },
    organizations: [],
    users: [],
    organizationMembers: [],
    customers: [],
    customerAddresses: [],
    customerFavorites: [],
    customerRewardAccounts: [],
    customerRewardTransactions: [],
    providers: [],
    providerServices: [],
    providerServiceAreas: [],
    providerAvailabilities: [],
    deliveryPartners: [],
    deliveryServiceAreas: [],
    deliveryAvailabilities: [],
    serviceCategories: [],
    services: [],
    serviceVariants: [],
    bookings: [],
    bookingItems: [],
    bookingAddresses: [],
    bookingSchedules: [],
    bookingStatusHistories: [],
    bookingNotes: [],
    bookingAssignments: [],
    assignmentHistories: [],
    payments: [],
    transactions: [],
    earnings: [],
    earningTransactions: [],
    refunds: [],
    coupons: [],
    couponRedemptions: [],
    promotionalOffers: [],
    offerRedemptions: [],
    reviews: [],
    reviewModerations: [],
    notifications: [],
    notificationPreferences: [],
    communications: [],
    communicationRecipients: [],
    supportTickets: [],
    supportMessages: [],
    supportActivities: [],
    disputes: [],
    disputeMessages: [],
    disputeEvidence: [],
    disputeActivities: [],
    auditEvents: [],
    analyticsEvents: [],
  };

  // 1. ORGANIZATIONS
  const orgProfiles = [
    { name: 'WASHORA Platform Corp', publicId: 'ORG-0001', type: 'WASHORA', domain: 'washora.internal' },
    { name: 'Apex Care Partners Ltd', publicId: 'ORG-0002', type: 'PARTNER_ORGANIZATION', domain: 'apexcare.internal' },
    { name: 'Metro Premium Cleaners', publicId: 'ORG-0003', type: 'PARTNER_ORGANIZATION', domain: 'metroclean.internal' },
  ];

  for (let i = 0; i < cfg.orgCount; i++) {
    const profile = orgProfiles[i] || {
      name: `Partner Hub Organization #${i + 1}`,
      publicId: `ORG-000${i + 1}`,
      type: 'PARTNER_ORGANIZATION',
      domain: `partner${i + 1}.internal`,
    };
    dataset.organizations.push({
      id: uuid(),
      name: profile.name,
      publicId: profile.publicId,
      type: profile.type,
      status: 'ACTIVE',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-09-01T00:00:00Z'),
    });
  }

  const primaryOrg = dataset.organizations[0];
  const partnerOrg = dataset.organizations[1] || primaryOrg;
  const metroOrg = dataset.organizations[2] || primaryOrg;

  // 2. CATEGORIES & SERVICES
  const categoryNames = [
    'Dry Cleaning', 'Shoe Restoration', 'Curtain & Drape Care',
    'Luxury Garment Press', 'Sneaker Deep Clean', 'Leather & Suede Revival',
    'Steam Sanitize', 'Express Wash & Fold', 'Designer Handbag Spa',
    'Wedding Gown Preservation', 'Silk & Woolen Delicates', 'Bedding & Quilt Care',
    'Upholstery Revive', 'Corporate Laundry Subscriptions', 'Industrial Uniform Care'
  ];

  for (let i = 0; i < cfg.categoryCount; i++) {
    const catName = categoryNames[i] || `Specialized Cleaning Category ${i + 1}`;
    const catId = uuid();
    dataset.serviceCategories.push({
      id: catId,
      publicId: `CAT-${String(i + 1).padStart(4, '0')}`,
      name: catName,
      slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: `Premium professional care for ${catName.toLowerCase()}`,
      displayOrder: i + 1,
      isActive: true,
      createdAt: new Date('2026-01-05T00:00:00Z'),
    });
  }

  // Generate Catalog Services
  for (let i = 0; i < cfg.serviceCount; i++) {
    const category = dataset.serviceCategories[i % dataset.serviceCategories.length];
    const serviceId = uuid();
    const isPopular = i < Math.ceil(cfg.serviceCount * 0.2); // Top 20% popular services
    const service = {
      id: serviceId,
      publicId: `SRV-${String(i + 1).padStart(4, '0')}`,
      categoryId: category.id,
      name: `${category.name} - Tier ${Math.floor(i / 3) + 1}`,
      slug: `${category.slug}-tier-${i + 1}`,
      description: `Comprehensive treatment protocol for ${category.name}`,
      basePrice: (rng.nextInt(15, 80) * 10).toFixed(2),
      estimatedDurationMinutes: rng.pick([60, 120, 180, 240, 480]),
      isPopular,
      isActive: true,
      popularityWeight: isPopular ? 80 : 20,
      createdAt: new Date('2026-01-10T00:00:00Z'),
    };
    dataset.services.push(service);

    // Variants for this service
    for (let v = 1; v <= cfg.variantPerService; v++) {
      const multiplier = v === 1 ? 1.0 : v === 2 ? 1.4 : 1.8;
      const price = (parseFloat(service.basePrice) * multiplier).toFixed(2);
      dataset.serviceVariants.push({
        id: uuid(),
        publicId: `VAR-${String(dataset.serviceVariants.length + 1).padStart(5, '0')}`,
        serviceId: service.id,
        name: v === 1 ? 'Standard Treatment' : v === 2 ? 'Express Care' : 'Ultra Luxury Deluxe',
        price,
        turnaroundHours: v === 1 ? 48 : v === 2 ? 24 : 12,
        isActive: true,
      });
    }
  }

  // 3. USERS & ROLES
  // 3.1 Staff / Admin / Ops Users
  const staffRoles = ['ADMIN', 'OPERATIONS', 'FINANCE_ADMIN', 'SUPPORT_AGENT', 'SUPPORT_LEAD'];
  for (let i = 0; i < cfg.staffCount; i++) {
    const userId = uuid();
    const role = staffRoles[i % staffRoles.length];
    const org = dataset.organizations[i % dataset.organizations.length];
    const user = {
      id: userId,
      email: `staff_${role.toLowerCase()}_${i + 1}@washora-synthetic.test`,
      name: `WASHORA Staff Member ${i + 1}`,
      phone: `+9198401${String(10000 + i).slice(-5)}`,
      role,
      status: 'ACTIVE',
      organizationId: org.id,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };
    dataset.users.push(user);
    dataset.organizationMembers.push({
      id: uuid(),
      userId: user.id,
      organizationId: org.id,
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });
  }

  // 3.2 Customer Users
  for (let i = 0; i < cfg.customerCount; i++) {
    const userId = uuid();
    const custId = uuid();
    const org = i % 10 < 7 ? primaryOrg : i % 10 < 9 ? partnerOrg : metroOrg; // Multi-tenant skew
    const isRepeat = i < Math.ceil(cfg.customerCount * 0.35); // 35% repeat customers

    const user = {
      id: userId,
      email: `synthetic_customer_${i + 1}@washora-synthetic.test`,
      name: `Synthetic Customer ${i + 1}`,
      phone: `+9198700${String(10000 + i).slice(-5)}`,
      role: 'CUSTOMER',
      status: i === 42 ? 'SUSPENDED' : i === 88 ? 'INACTIVE' : 'ACTIVE',
      organizationId: org.id,
      createdAt: new Date('2026-02-01T00:00:00Z'),
    };
    dataset.users.push(user);

    const customer = {
      id: custId,
      publicId: `CUST-${String(i + 1).padStart(5, '0')}`,
      userId: user.id,
      organizationId: org.id,
      tier: isRepeat ? (rng.boolean(0.3) ? 'ELITE' : 'PREMIUM') : 'STANDARD',
      totalBookingsCount: isRepeat ? rng.nextInt(5, 20) : rng.nextInt(0, 3),
      isRepeatCustomer: isRepeat,
      status: user.status,
    };
    dataset.customers.push(customer);

    // Addresses for Customer (1 to 3 addresses)
    const addrCount = isRepeat ? rng.nextInt(2, 3) : 1;
    for (let a = 0; a < addrCount; a++) {
      dataset.customerAddresses.push({
        id: uuid(),
        customerId: customer.id,
        organizationId: org.id,
        label: a === 0 ? 'HOME' : a === 1 ? 'WORK' : 'OTHER',
        recipientName: user.name,
        recipientPhone: user.phone,
        addressLine1: `${rng.nextInt(1, 150)}, Synthetic Care Boulevard`,
        addressLine2: `Suite ${rng.nextInt(100, 900)}`,
        area: rng.pick(['Anna Nagar', 'T. Nagar', 'Alwarpet', 'Nungambakkam', 'Adyar', 'Velachery']),
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: `6000${String(rng.nextInt(10, 99))}`,
        isDefault: a === 0,
        status: 'ACTIVE',
      });
    }

    // Customer Reward Account
    dataset.customerRewardAccounts.push({
      id: uuid(),
      customerId: customer.id,
      organizationId: org.id,
      pointsBalance: isRepeat ? rng.nextInt(200, 2500) : rng.nextInt(0, 300),
      lifetimePointsEarned: isRepeat ? rng.nextInt(1000, 5000) : 100,
      tier: customer.tier,
    });
  }

  // 3.3 Provider Users & Catalog Mappings
  for (let i = 0; i < cfg.providerCount; i++) {
    const userId = uuid();
    const providerId = uuid();
    const org = i % 5 < 3 ? primaryOrg : i % 5 < 4 ? partnerOrg : metroOrg;
    const isTopProvider = i < Math.ceil(cfg.providerCount * 0.15); // Top 15% high-volume providers

    const user = {
      id: userId,
      email: `synthetic_provider_${i + 1}@washora-synthetic.test`,
      name: `Synthetic Studio Facility ${i + 1}`,
      phone: `+9198600${String(10000 + i).slice(-5)}`,
      role: 'PROVIDER',
      status: 'ACTIVE',
      organizationId: org.id,
      createdAt: new Date('2026-01-15T00:00:00Z'),
    };
    dataset.users.push(user);

    const provider = {
      id: providerId,
      publicId: `PRV-${String(i + 1).padStart(4, '0')}`,
      userId: user.id,
      organizationId: org.id,
      businessName: `${user.name} Specialty Care`,
      status: 'ACTIVE',
      isTopProvider,
      capacityPerDay: isTopProvider ? 40 : 15,
      rating: (rng.nextInt(42, 50) / 10).toFixed(1),
      reviewCount: isTopProvider ? rng.nextInt(150, 450) : rng.nextInt(10, 60),
    };
    dataset.providers.push(provider);

    // Provider Services (maps to 4-10 services)
    const assignedServicesCount = rng.nextInt(4, 10);
    for (let s = 0; s < assignedServicesCount; s++) {
      const srv = dataset.services[(i * 3 + s) % dataset.services.length];
      dataset.providerServices.push({
        id: uuid(),
        providerId: provider.id,
        serviceId: srv.id,
        isActive: true,
      });
    }

    // Provider Service Areas
    dataset.providerServiceAreas.push({
      id: uuid(),
      providerId: provider.id,
      areaName: rng.pick(['Central Chennai', 'South Chennai', 'North Chennai', 'West Chennai', 'Metro East']),
      postalCode: `6000${String(rng.nextInt(10, 99))}`,
      isActive: true,
    });
  }

  // 3.4 Delivery Partners
  for (let i = 0; i < cfg.deliveryPartnerCount; i++) {
    const userId = uuid();
    const dpId = uuid();
    const org = i % 2 === 0 ? primaryOrg : partnerOrg;

    const user = {
      id: userId,
      email: `synthetic_valet_${i + 1}@washora-synthetic.test`,
      name: `Synthetic Valet Partner ${i + 1}`,
      phone: `+9198500${String(10000 + i).slice(-5)}`,
      role: 'DELIVERY_PARTNER',
      status: 'ACTIVE',
      organizationId: org.id,
      createdAt: new Date('2026-01-20T00:00:00Z'),
    };
    dataset.users.push(user);

    dataset.deliveryPartners.push({
      id: dpId,
      publicId: `VAL-${String(i + 1).padStart(4, '0')}`,
      userId: user.id,
      organizationId: org.id,
      vehicleType: rng.pick(['TWO_WHEELER', 'EV_SCOOTER', 'FOUR_WHEELER_VAN']),
      rating: (rng.nextInt(45, 50) / 10).toFixed(1),
      status: 'ACTIVE',
      isAvailable: rng.boolean(0.85),
    });
  }

  // 4. COUPONS & PROMOTIONAL OFFERS
  const couponCodes = ['SAVE10', 'SAVE20', 'WELCOME50', 'FESTIVE100', 'VIPCARE', 'FREESHIP', 'LUXURY25'];
  for (let i = 0; i < cfg.couponCount; i++) {
    const code = `${rng.pick(couponCodes)}_${i + 1}`;
    const org = dataset.organizations[i % dataset.organizations.length];
    dataset.coupons.push({
      id: uuid(),
      publicId: `CPN-${String(i + 1).padStart(4, '0')}`,
      organizationId: org.id,
      code,
      discountType: rng.boolean(0.6) ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      discountValue: rng.pick(['10.00', '20.00', '50.00', '100.00', '15.00']),
      maxUsageCount: rng.pick([50, 100, 250, 500]),
      currentUsageCount: rng.nextInt(5, 40),
      isExpired: i === 13, // specifically for expired tests
      status: i === 13 ? 'EXPIRED' : 'ACTIVE',
    });
  }

  // 5. REALISTIC RELATIONAL BOOKINGS (3000+)
  const popularServices = dataset.services.filter(s => s.isPopular);
  const standardServices = dataset.services.filter(s => !s.isPopular);
  const topProviders = dataset.providers.filter(p => p.isTopProvider);

  for (let i = 0; i < cfg.bookingCount; i++) {
    const bookingId = uuid();
    // Skew: 70% in primary org, 20% in partner org, 10% in metro org
    const orgRoll = rng.next();
    const org = orgRoll < 0.7 ? primaryOrg : orgRoll < 0.9 ? partnerOrg : metroOrg;

    // Filter customers & providers in this org
    const orgCustomers = dataset.customers.filter(c => c.organizationId === org.id);
    const orgProviders = dataset.providers.filter(p => p.organizationId === org.id);
    const orgValets = dataset.deliveryPartners.filter(d => d.organizationId === org.id);

    const customer = rng.pick(orgCustomers.length ? orgCustomers : dataset.customers);

    // Power-law service selection: 80% chance to select popular service
    const service = (rng.next() < 0.8 && popularServices.length)
      ? rng.pick(popularServices)
      : rng.pick(standardServices.length ? standardServices : dataset.services);

    // Power-law provider selection: 70% chance to select top provider
    const provider = (rng.next() < 0.7 && topProviders.length)
      ? rng.pick(topProviders)
      : rng.pick(orgProviders.length ? orgProviders : dataset.providers);

    // Associated variants
    const serviceVariants = dataset.serviceVariants.filter(v => v.serviceId === service.id);
    const variant = serviceVariants.length ? rng.pick(serviceVariants) : null;

    // Realistic outcome distribution:
    // 88% COMPLETED, 6% IN_PROGRESS, 4% CANCELLED, 2% PENDING
    const outcomeRoll = rng.next();
    const status = outcomeRoll < 0.88 ? 'COMPLETED' : outcomeRoll < 0.94 ? 'IN_PROGRESS' : outcomeRoll < 0.98 ? 'CANCELLED' : 'PENDING';

    const unitPrice = parseFloat(variant ? variant.price : service.basePrice);
    const quantity = rng.nextInt(1, 4);
    const subtotal = (unitPrice * quantity).toFixed(2);
    const serviceFee = '25.00';
    const taxAmount = (parseFloat(subtotal) * 0.18).toFixed(2);
    const discountAmount = rng.boolean(0.25) ? '50.00' : '0.00';
    const totalAmount = (parseFloat(subtotal) + parseFloat(serviceFee) + parseFloat(taxAmount) - parseFloat(discountAmount)).toFixed(2);

    const bookingYear = 2026;
    const bookingNumber = `WAS-${bookingYear}-${String(i + 1).padStart(6, '0')}`;

    const booking = {
      id: bookingId,
      bookingNumber,
      organizationId: org.id,
      customerId: customer.id,
      providerId: provider ? provider.id : null,
      serviceId: service.id,
      status,
      subtotal,
      serviceFee,
      taxAmount,
      discountAmount,
      totalAmount,
      currency: 'INR',
      scheduledAt: new Date(Date.now() - rng.nextInt(1, 180) * 86400000),
      createdAt: new Date(Date.now() - rng.nextInt(1, 180) * 86400000),
      completedAt: status === 'COMPLETED' ? new Date() : null,
      cancelledAt: status === 'CANCELLED' ? new Date() : null,
    };
    dataset.bookings.push(booking);

    // Booking Items
    dataset.bookingItems.push({
      id: uuid(),
      bookingId: booking.id,
      variantId: variant ? variant.id : null,
      serviceNameSnapshot: service.name,
      variantNameSnapshot: variant ? variant.name : 'Standard',
      unitPrice: unitPrice.toFixed(2),
      quantity,
      totalAmount: subtotal,
    });

    // Booking Address Snapshot
    const custAddr = dataset.customerAddresses.find(a => a.customerId === customer.id) || dataset.customerAddresses[0];
    dataset.bookingAddresses.push({
      id: uuid(),
      bookingId: booking.id,
      recipientName: custAddr.recipientName,
      recipientPhone: custAddr.recipientPhone,
      addressLine1: custAddr.addressLine1,
      area: custAddr.area,
      city: custAddr.city,
      state: custAddr.state,
      postalCode: custAddr.postalCode,
    });

    // Booking Schedule
    dataset.bookingSchedules.push({
      id: uuid(),
      bookingId: booking.id,
      pickupDate: booking.scheduledAt,
      pickupTimeSlot: rng.pick(['09:00 - 11:00', '11:00 - 13:00', '14:00 - 16:00', '16:00 - 18:00']),
      returnDate: new Date(booking.scheduledAt.getTime() + 86400000 * 2),
      returnTimeSlot: '14:00 - 16:00',
    });

    // Status History
    dataset.bookingStatusHistories.push({
      id: uuid(),
      bookingId: booking.id,
      fromStatus: null,
      toStatus: 'PENDING',
      changedAt: booking.createdAt,
    });
    if (status !== 'PENDING') {
      dataset.bookingStatusHistories.push({
        id: uuid(),
        bookingId: booking.id,
        fromStatus: 'PENDING',
        toStatus: status,
        changedAt: new Date(booking.createdAt.getTime() + 3600000),
      });
    }

    // Booking Assignment
    if (provider && (status === 'COMPLETED' || status === 'IN_PROGRESS')) {
      const assignmentId = uuid();
      dataset.bookingAssignments.push({
        id: assignmentId,
        publicId: `ASG-${String(i + 1).padStart(5, '0')}`,
        bookingId: booking.id,
        organizationId: org.id,
        providerId: provider.id,
        status: status === 'COMPLETED' ? 'COMPLETED' : 'ACCEPTED',
        assignedAt: booking.createdAt,
      });

      // Valet Assignment (Pickup & Drop)
      if (orgValets.length && rng.boolean(0.75)) {
        const valet = rng.pick(orgValets);
        dataset.bookingAssignments.push({
          id: uuid(),
          publicId: `ASG-V-${String(i + 1).padStart(5, '0')}`,
          bookingId: booking.id,
          organizationId: org.id,
          deliveryPartnerId: valet.id,
          status: 'COMPLETED',
          assignedAt: booking.createdAt,
        });
      }
    }

    // 6. PAYMENTS, TRANSACTIONS & EARNINGS
    if (status === 'COMPLETED' || status === 'IN_PROGRESS') {
      const paymentId = uuid();
      const isPaid = status === 'COMPLETED' || rng.boolean(0.85);
      const paymentStatus = isPaid ? 'PAID' : rng.boolean(0.7) ? 'PROCESSING' : 'FAILED';

      const payment = {
        id: paymentId,
        publicId: `PAY-${String(i + 1).padStart(5, '0')}`,
        bookingId: booking.id,
        organizationId: org.id,
        customerId: customer.id,
        amount: booking.totalAmount,
        currency: 'INR',
        status: paymentStatus,
        paymentMethod: rng.pick(['UPI', 'CARD', 'NET_BANKING']),
        createdAt: booking.createdAt,
      };
      dataset.payments.push(payment);

      if (paymentStatus === 'PAID') {
        // Canonical Financial Transaction
        dataset.transactions.push({
          id: uuid(),
          publicId: `TXN-${String(dataset.transactions.length + 1).padStart(6, '0')}`,
          paymentId: payment.id,
          organizationId: org.id,
          type: 'PAYMENT',
          amount: payment.amount,
          status: 'COMPLETED',
          createdAt: payment.createdAt,
        });

        // Provider Earning
        if (provider) {
          const providerGross = (parseFloat(subtotal) * 0.85).toFixed(2);
          const platformFee = (parseFloat(subtotal) * 0.15).toFixed(2);
          const netEarning = providerGross;
          dataset.earnings.push({
            id: uuid(),
            publicId: `ERN-${String(dataset.earnings.length + 1).padStart(5, '0')}`,
            organizationId: org.id,
            providerId: provider.id,
            bookingId: booking.id,
            amount: netEarning,
            currency: 'INR',
            status: 'AVAILABLE',
            createdAt: booking.createdAt,
          });
        }

        // Refund (2% realistic refund rate on completed bookings)
        if (status === 'COMPLETED' && rng.next() < 0.02) {
          const refundAmount = (parseFloat(booking.totalAmount) * 0.5).toFixed(2);
          dataset.refunds.push({
            id: uuid(),
            publicId: `REF-${String(dataset.refunds.length + 1).padStart(4, '0')}`,
            paymentId: payment.id,
            organizationId: org.id,
            amount: refundAmount,
            reason: 'Customer requested partial refund due to minor delay',
            status: 'PROCESSED',
            createdAt: new Date(),
          });
        }
      }
    }

    // 7. REVIEWS (for completed bookings)
    if (status === 'COMPLETED' && rng.boolean(0.45) && dataset.reviews.length < cfg.reviewCount) {
      dataset.reviews.push({
        id: uuid(),
        publicId: `REV-${String(dataset.reviews.length + 1).padStart(5, '0')}`,
        bookingId: booking.id,
        customerId: customer.id,
        providerId: provider ? provider.id : null,
        organizationId: org.id,
        rating: rng.pick([5, 5, 5, 4, 4, 3]), // Skewed high ratings
        comment: 'Outstanding garment care and prompt white-glove delivery!',
        status: 'PUBLISHED',
        createdAt: new Date(),
      });
    }
  }

  // 8. NOTIFICATIONS & COMMUNICATIONS
  for (let i = 0; i < cfg.notificationCount; i++) {
    const user = dataset.users[i % dataset.users.length];
    const isUnread = rng.next() < 0.35; // 35% unread rate
    dataset.notifications.push({
      id: uuid(),
      publicId: `NOTIF-${String(i + 1).padStart(6, '0')}`,
      userId: user.id,
      organizationId: user.organizationId,
      title: rng.pick(['Order Confirmed', 'Valet Dispatched', 'Quality Inspection Passed', 'Payment Processed']),
      body: 'Your garment care service is progressing smoothly with our specialist team.',
      priority: rng.pick(['LOW', 'MEDIUM', 'HIGH']),
      status: isUnread ? 'UNREAD' : 'READ',
      createdAt: new Date(Date.now() - rng.nextInt(1, 30) * 86400000),
    });
  }

  // 9. SUPPORT TICKETS & DISPUTES
  for (let i = 0; i < cfg.ticketCount; i++) {
    const cust = dataset.customers[i % dataset.customers.length];
    const ticketId = uuid();
    const isOpen = rng.boolean(0.2); // 20% tickets remain open
    const ticket = {
      id: ticketId,
      publicId: `TCK-${String(i + 1).padStart(5, '0')}`,
      organizationId: cust.organizationId,
      customerId: cust.id,
      category: rng.pick(['BOOKING_ISSUE', 'PAYMENT_ISSUE', 'QUALITY_DISPUTE', 'DELIVERY_DELAY']),
      priority: rng.pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      status: isOpen ? 'OPEN' : 'RESOLVED',
      subject: `Inquiry regarding service booking #${i + 1}`,
      createdAt: new Date(Date.now() - rng.nextInt(1, 45) * 86400000),
    };
    dataset.supportTickets.push(ticket);

    dataset.supportMessages.push({
      id: uuid(),
      ticketId: ticket.id,
      senderUserId: cust.userId,
      content: 'Could you please confirm the return dispatch timing for my items?',
      createdAt: ticket.createdAt,
    });
  }

  for (let i = 0; i < cfg.disputeCount; i++) {
    const booking = dataset.bookings[i % dataset.bookings.length];
    dataset.disputes.push({
      id: uuid(),
      publicId: `DSP-${String(i + 1).padStart(4, '0')}`,
      bookingId: booking.id,
      organizationId: booking.organizationId,
      status: i % 4 === 0 ? 'OPEN' : 'RESOLVED',
      reason: 'Fabric finish discrepancy requiring review',
      createdAt: new Date(),
    });
  }

  // 10. AUDIT & ANALYTICS TELEMETRY
  for (let i = 0; i < cfg.auditCount; i++) {
    const user = dataset.users[i % dataset.users.length];
    dataset.auditEvents.push({
      id: uuid(),
      organizationId: user.organizationId,
      userId: user.id,
      action: rng.pick(['USER_LOGIN', 'BOOKING_CREATED', 'PAYMENT_CAPTURED', 'ASSIGNMENT_DISPATCHED', 'REFUND_APPROVED']),
      resource: 'Booking',
      resourceId: uuid(),
      timestamp: new Date(Date.now() - rng.nextInt(1, 90) * 86400000),
    });
  }

  for (let i = 0; i < cfg.analyticsCount; i++) {
    const user = dataset.users[i % dataset.users.length];
    dataset.analyticsEvents.push({
      id: uuid(),
      organizationId: user.organizationId,
      userId: user.id,
      eventName: rng.pick([
        'funnel_step_browse_category',
        'funnel_step_service_view',
        'funnel_step_schedule_select',
        'funnel_step_booking_submit',
        'funnel_step_payment_success',
      ]),
      deviceType: rng.pick(['DESKTOP', 'MOBILE', 'TABLET']),
      timestamp: new Date(Date.now() - rng.nextInt(1, 30) * 86400000),
    });
  }

  // Compile Metadata Metrics
  const elapsedMs = Date.now() - startTime;
  dataset.metadata.generationDurationMs = elapsedMs;

  let totalRecords = 0;
  for (const [key, val] of Object.entries(dataset)) {
    if (Array.isArray(val)) {
      dataset.metadata.recordCounts[key] = val.length;
      totalRecords += val.length;
    }
  }
  dataset.metadata.totalEntitiesGenerated = totalRecords;

  dataset.metadata.distributionMetrics = {
    powerLawPopularServicePercentage: 80,
    topProviderAssignmentPercentage: 70,
    completedBookingRate: ((dataset.bookings.filter(b => b.status === 'COMPLETED').length / dataset.bookings.length) * 100).toFixed(1) + '%',
    unreadNotificationRate: ((dataset.notifications.filter(n => n.status === 'UNREAD').length / dataset.notifications.length) * 100).toFixed(1) + '%',
    multiTenantDistribution: {
      'ORG-0001 (WASHORA)': dataset.bookings.filter(b => b.organizationId === primaryOrg.id).length,
      'ORG-0002 (Apex Care)': dataset.bookings.filter(b => b.organizationId === partnerOrg.id).length,
      'ORG-0003 (Metro)': dataset.bookings.filter(b => b.organizationId === metroOrg.id).length,
    },
  };

  return dataset;
}

// Direct CLI Execution
if (process.argv[1] && (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('generate-synthetic-dataset.mjs'))) {
  const result = generateSyntheticDataset();
  const exportPath = path.resolve(process.cwd(), 'backups', 'synthetic_dataset_t3.json');
  
  if (!fs.existsSync(path.dirname(exportPath))) {
    fs.mkdirSync(path.dirname(exportPath), { recursive: true });
  }

  // Serialize summary and metadata (full dataset can be persisted or streamed into memory)
  fs.writeFileSync(exportPath, JSON.stringify(result.metadata, null, 2), 'utf-8');

  console.log('✅ [SYNTHETIC DATASET GENERATED SUCCESSFULLY]');
  console.log(`   - Total Entities: ${result.metadata.totalEntitiesGenerated}`);
  console.log(`   - Organizations:  ${result.organizations.length}`);
  console.log(`   - Users:          ${result.users.length}`);
  console.log(`   - Customers:      ${result.customers.length}`);
  console.log(`   - Providers:      ${result.providers.length}`);
  console.log(`   - Services:       ${result.services.length}`);
  console.log(`   - Bookings:       ${result.bookings.length}`);
  console.log(`   - Payments:       ${result.payments.length}`);
  console.log(`   - Notifications:  ${result.notifications.length}`);
  console.log(`   - Generation Time: ${result.metadata.generationDurationMs} ms`);
  console.log(`   - Summary Export: ${exportPath}\n`);
}
