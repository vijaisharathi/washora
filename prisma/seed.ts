/**
 * WASHORA Production Database Deterministic Seed Script
 * Authoritative Reference: WASHORA_Complete_Production_Database_Schema_PRD.docx
 * Architecture: Multi-tenant relational marketplace on PostgreSQL
 * Organizations: ORG-0001 (LuxeCare Hub), ORG-0002 (Metro Wash Operations)
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Deterministic seed generation constants
const ORG_1_PUBLIC_ID = 'ORG-0001';
const ORG_2_PUBLIC_ID = 'ORG-0002';

async function main() {
  console.log('🚀 Starting WASHORA Production Database Deterministic Seed...');

  // 1. ROLES & PERMISSIONS
  console.log('📦 Seeding Roles & Permissions...');
  const roleDefs = [
    { type: 'ADMIN' as const, name: 'Platform Administrator', description: 'Full access to organization and marketplace operations' },
    { type: 'OPERATIONS' as const, name: 'Operations Dispatcher', description: 'Manage orders, assign providers, and coordinate delivery valets' },
    { type: 'FINANCE_ADMIN' as const, name: 'Finance Administrator', description: 'Manage ledger, payments, earnings, payouts, and refunds' },
    { type: 'SUPPORT_LEAD' as const, name: 'Customer Support Lead', description: 'Manage support tickets, disputes, and escalated cases' },
    { type: 'SUPPORT_AGENT' as const, name: 'Customer Support Agent', description: 'Handle support inquiries and customer communications' },
    { type: 'READ_ONLY' as const, name: 'Audit & Read-Only Observer', description: 'Read-only access for auditing and compliance' },
    { type: 'CUSTOMER' as const, name: 'Marketplace Customer', description: 'Customer role for placing orders and booking services' },
    { type: 'PROVIDER' as const, name: 'Service Provider / Studio', description: 'Provider role for managing workshop operations and catalog' },
    { type: 'DELIVERY_PARTNER' as const, name: 'Delivery Partner / Valet', description: 'Delivery partner role for pickup and drop fulfillment' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of roleDefs) {
    const role = await prisma.role.upsert({
      where: { type: r.type },
      update: { name: r.name, description: r.description },
      create: { type: r.type, name: r.name, description: r.description },
    });
    roleMap[r.type] = role.id;
  }

  const permissionCodes = [
    // Organization & User
    { code: 'organization.read', module: 'organization', description: 'View organization details' },
    { code: 'organization.update', module: 'organization', description: 'Manage organization settings' },
    { code: 'user.read', module: 'user', description: 'View users and members' },
    { code: 'user.update', module: 'user', description: 'Manage user profiles and roles' },

    // Customer
    { code: 'customer.read', module: 'customer', description: 'View all customers' },
    { code: 'customer.create', module: 'customer', description: 'Create customer profiles' },
    { code: 'customer.update', module: 'customer', description: 'Update customer status and tier' },
    { code: 'customer.delete', module: 'customer', description: 'Delete customer profiles' },
    { code: 'customer.read.self', module: 'customer', description: 'View own customer profile' },
    { code: 'customer.update.self', module: 'customer', description: 'Update own customer profile' },

    // Provider
    { code: 'provider.read', module: 'provider', description: 'View all providers' },
    { code: 'provider.create', module: 'provider', description: 'Create provider studio' },
    { code: 'provider.update', module: 'provider', description: 'Update provider studios' },
    { code: 'provider.approve', module: 'provider', description: 'Approve or reject provider applications' },
    { code: 'provider.suspend', module: 'provider', description: 'Suspend provider operations' },
    { code: 'provider.read.self', module: 'provider', description: 'View own provider profile' },
    { code: 'provider.update.self', module: 'provider', description: 'Update own provider profile' },

    // Delivery Partner
    { code: 'delivery_partner.read', module: 'delivery', description: 'View all delivery partners' },
    { code: 'delivery_partner.create', module: 'delivery', description: 'Onboard delivery partners' },
    { code: 'delivery_partner.update', module: 'delivery', description: 'Update delivery partner records' },
    { code: 'delivery_partner.approve', module: 'delivery', description: 'Approve delivery partner verifications' },
    { code: 'delivery_partner.suspend', module: 'delivery', description: 'Suspend delivery partners' },
    { code: 'delivery_partner.read.self', module: 'delivery', description: 'View own delivery partner profile' },
    { code: 'delivery_partner.update.self', module: 'delivery', description: 'Update own delivery partner profile' },

    // Catalog & Services
    { code: 'service.read', module: 'catalog', description: 'View service catalog' },
    { code: 'service.create', module: 'catalog', description: 'Create catalog services' },
    { code: 'service.update', module: 'catalog', description: 'Update catalog services and pricing' },
    { code: 'service.archive', module: 'catalog', description: 'Archive catalog services' },

    // Bookings & Orders
    { code: 'booking.read', module: 'booking', description: 'View all bookings' },
    { code: 'booking.create', module: 'booking', description: 'Create bookings' },
    { code: 'booking.update', module: 'booking', description: 'Update booking status, schedule, or cancel' },
    { code: 'booking.cancel', module: 'booking', description: 'Cancel bookings' },
    { code: 'booking.read.self', module: 'booking', description: 'View own bookings' },
    { code: 'booking.create.self', module: 'booking', description: 'Place own bookings' },
    { code: 'booking.update.self', module: 'booking', description: 'Reschedule own bookings' },
    { code: 'booking.cancel.self', module: 'booking', description: 'Cancel own bookings' },
    { code: 'booking.read.assigned', module: 'booking', description: 'View assigned provider/delivery bookings' },
    { code: 'booking.update.assigned', module: 'booking', description: 'Update assigned booking fulfillment state' },

    // Assignments
    { code: 'assignment.read', module: 'assignment', description: 'View operational assignments' },
    { code: 'assignment.create', module: 'assignment', description: 'Create valet/provider assignments' },
    { code: 'assignment.update', module: 'assignment', description: 'Reassign or modify assignments' },
    { code: 'assignment.read.self', module: 'assignment', description: 'View own task assignments' },
    { code: 'assignment.update.self', module: 'assignment', description: 'Accept or complete assigned tasks' },

    // Finance & Payments (B10 Granular Financial Domain)
    { code: 'payment.read', module: 'finance', description: 'View financial ledger and payments' },
    { code: 'payments.read.self', module: 'finance', description: 'View own customer payments' },
    { code: 'payments.create.self', module: 'finance', description: 'Initiate own customer payments' },
    { code: 'payments.read.organization', module: 'finance', description: 'View organization payments' },
    { code: 'payments.process', module: 'finance', description: 'Process payment status transitions' },
    { code: 'payments.update', module: 'finance', description: 'Update payment attributes' },
    { code: 'payments.fail', module: 'finance', description: 'Mark payments failed' },
    { code: 'payments.cancel', module: 'finance', description: 'Cancel pending payments' },

    { code: 'transactions.read.self', module: 'finance', description: 'View own ledger transactions' },
    { code: 'transactions.read.organization', module: 'finance', description: 'View organization ledger transactions' },

    { code: 'refund.create', module: 'finance', description: 'Issue customer refunds' },
    { code: 'refunds.read.self', module: 'finance', description: 'View own customer refunds' },
    { code: 'refunds.read.organization', module: 'finance', description: 'View organization refunds' },
    { code: 'refunds.create', module: 'finance', description: 'Issue customer refunds with balance checks' },
    { code: 'refunds.process', module: 'finance', description: 'Process refund transitions' },
    { code: 'refunds.fail', module: 'finance', description: 'Mark refunds failed' },

    { code: 'earning.read', module: 'finance', description: 'View provider and valet earnings' },
    { code: 'earning.read.self', module: 'finance', description: 'View own earnings balance and history' },
    { code: 'earnings.read.self', module: 'finance', description: 'View own earnings' },
    { code: 'earnings.read.organization', module: 'finance', description: 'View organization earnings' },
    { code: 'earnings.adjust', module: 'finance', description: 'Adjust earnings with compensating transactions' },
    { code: 'earnings.process', module: 'finance', description: 'Process earning payouts' },
    { code: 'earnings.reverse', module: 'finance', description: 'Reverse earnings' },

    { code: 'financial.summary.self', module: 'finance', description: 'View own financial summary' },
    { code: 'financial.summary.organization', module: 'finance', description: 'View organization financial summary' },

    // Promotions, Coupons & Loyalty (B11)
    { code: 'coupons.read.organization', module: 'promotions', description: 'View organization coupons' },
    { code: 'coupons.create', module: 'promotions', description: 'Create organization coupons' },
    { code: 'coupons.update', module: 'promotions', description: 'Update organization coupons' },
    { code: 'coupons.activate', module: 'promotions', description: 'Activate coupons' },
    { code: 'coupons.pause', module: 'promotions', description: 'Pause coupons' },
    { code: 'coupons.disable', module: 'promotions', description: 'Disable coupons' },
    { code: 'coupons.redemptions.read', module: 'promotions', description: 'View coupon redemption history' },

    { code: 'offers.read.organization', module: 'promotions', description: 'View promotional offers' },
    { code: 'offers.create', module: 'promotions', description: 'Create promotional offers' },
    { code: 'offers.update', module: 'promotions', description: 'Update promotional offers' },
    { code: 'offers.activate', module: 'promotions', description: 'Activate promotional offers' },
    { code: 'offers.pause', module: 'promotions', description: 'Pause promotional offers' },
    { code: 'offers.disable', module: 'promotions', description: 'Disable promotional offers' },
    { code: 'offers.redemptions.read', module: 'promotions', description: 'View offer redemption history' },

    { code: 'rewards.read.self', module: 'promotions', description: 'View own customer reward balance and transactions' },
    { code: 'rewards.redeem.self', module: 'promotions', description: 'Redeem own customer reward points' },
    { code: 'rewards.read.organization', module: 'promotions', description: 'View all tenant customer reward accounts and transactions' },
    { code: 'rewards.adjust', module: 'promotions', description: 'Manually adjust customer reward points' },
    { code: 'rewards.reverse', module: 'promotions', description: 'Reverse customer reward transactions' },
    { code: 'rewards.earn', module: 'promotions', description: 'Award customer reward points' },

    // Reviews & Moderation (B12)
    { code: 'review.read', module: 'reviews', description: 'View customer reviews' },
    { code: 'review.moderate', module: 'reviews', description: 'Moderate, flag, or hide reviews' },
    { code: 'review.read.self', module: 'reviews', description: 'View own reviews' },
    { code: 'review.create.self', module: 'reviews', description: 'Submit review for completed booking' },
    { code: 'reviews.read.self', module: 'reviews', description: 'View own customer reviews' },
    { code: 'reviews.create.self', module: 'reviews', description: 'Submit review for completed booking' },
    { code: 'reviews.update.self', module: 'reviews', description: 'Edit own published review' },
    { code: 'reviews.withdraw.self', module: 'reviews', description: 'Withdraw own customer review' },
    { code: 'reviews.report', module: 'reviews', description: 'Report review for moderation' },
    { code: 'reviews.read.organization', module: 'reviews', description: 'View all organization reviews' },
    { code: 'reviews.moderate', module: 'reviews', description: 'Perform moderation actions on reviews' },
    { code: 'reviews.publish', module: 'reviews', description: 'Approve and publish reviews' },
    { code: 'reviews.hide', module: 'reviews', description: 'Hide reviews from public visibility' },
    { code: 'reviews.reject', module: 'reviews', description: 'Reject inappropriate reviews' },
    { code: 'reviews.restore', module: 'reviews', description: 'Restore previously hidden reviews' },
    { code: 'reviews.moderation-history.read', module: 'reviews', description: 'View review moderation audit trail' },

    // Review Reports (B12)
    { code: 'review-reports.create', module: 'review-reports', description: 'Submit review abuse report' },
    { code: 'review-reports.read.organization', module: 'review-reports', description: 'View organization abuse reports' },
    { code: 'review-reports.review', module: 'review-reports', description: 'Start review report investigation' },
    { code: 'review-reports.resolve', module: 'review-reports', description: 'Resolve review report with action' },
    { code: 'review-reports.dismiss', module: 'review-reports', description: 'Dismiss unfounded review report' },

    // Review Responses (B12)
    { code: 'review-responses.read.self', module: 'review-responses', description: 'View provider official responses' },
    { code: 'review-responses.create.self', module: 'review-responses', description: 'Post official response to customer review' },
    { code: 'review-responses.update.self', module: 'review-responses', description: 'Update official provider response' },
    { code: 'review-responses.delete.self', module: 'review-responses', description: 'Delete official provider response' },

    // Notifications
    { code: 'notification.read', module: 'notification', description: 'View system notifications' },
    { code: 'notification.manage', module: 'notification', description: 'Broadcast notifications' },
    { code: 'notification.read.self', module: 'notification', description: 'View own notifications' },
    { code: 'notification.update.self', module: 'notification', description: 'Mark own notifications as read' },

    // Notifications & Communications (B13 Granular Domain)
    { code: 'notifications.read.self', module: 'notifications', description: 'View own in-app notifications' },
    { code: 'notifications.update.self', module: 'notifications', description: 'Mark own notifications read or archived' },
    { code: 'notifications.preferences.read.self', module: 'notifications', description: 'View own notification preferences' },
    { code: 'notifications.preferences.update.self', module: 'notifications', description: 'Update own notification preferences' },
    { code: 'notifications.read.organization', module: 'notifications', description: 'View organization notifications' },
    { code: 'notifications.broadcast.create', module: 'notifications', description: 'Create and dispatch organization-wide broadcasts' },
    { code: 'notifications.templates.read', module: 'notifications', description: 'View notification templates' },
    { code: 'notifications.templates.create', module: 'notifications', description: 'Create notification templates' },
    { code: 'notifications.templates.update', module: 'notifications', description: 'Update notification templates' },
    { code: 'communications.read.organization', module: 'communications', description: 'View organization communications and delivery records' },
    { code: 'communications.create', module: 'communications', description: 'Create and dispatch communication messages' },
    { code: 'communications.retry', module: 'communications', description: 'Retry failed communication delivery attempts' },
    { code: 'communications.cancel', module: 'communications', description: 'Cancel queued communication delivery' },
    { code: 'communications.read.self', module: 'communications', description: 'View own communication delivery records' },
    { code: 'notifications.admin', module: 'notifications', description: 'Full administrative access to notifications and communications' },

    // Support & Disputes (B14 Granular Domain)
    { code: 'support.read', module: 'support', description: 'View support tickets' },
    { code: 'support.update', module: 'support', description: 'Update support tickets' },
    { code: 'support.create.self', module: 'support', description: 'Create own support ticket' },
    { code: 'support.read.self', module: 'support', description: 'View own support tickets' },
    { code: 'support.message.self', module: 'support', description: 'Post messages to own support ticket' },
    { code: 'support.reopen.self', module: 'support', description: 'Reopen own resolved support ticket' },
    { code: 'support.read.organization', module: 'support', description: 'View all organization support tickets' },
    { code: 'support.message.organization', module: 'support', description: 'Post support messages as operations' },
    { code: 'support.assign', module: 'support', description: 'Assign support ticket to agent' },
    { code: 'support.unassign', module: 'support', description: 'Unassign support ticket from agent' },
    { code: 'support.priority.update', module: 'support', description: 'Update support ticket priority' },
    { code: 'support.escalate', module: 'support', description: 'Escalate support ticket' },
    { code: 'support.resolve', module: 'support', description: 'Resolve support ticket' },
    { code: 'support.close', module: 'support', description: 'Close support ticket' },
    { code: 'support.notes.read', module: 'support', description: 'View internal support notes' },
    { code: 'support.notes.create', module: 'support', description: 'Create internal support notes' },
    { code: 'support.create-dispute', module: 'support', description: 'Cross-escalate support ticket to formal dispute' },

    { code: 'dispute.read', module: 'disputes', description: 'View disputes' },
    { code: 'dispute.update', module: 'disputes', description: 'Update disputes' },
    { code: 'disputes.create.self', module: 'disputes', description: 'File own dispute' },
    { code: 'disputes.read.self', module: 'disputes', description: 'View own disputes' },
    { code: 'disputes.message.self', module: 'disputes', description: 'Post messages to own dispute' },
    { code: 'disputes.evidence.create.self', module: 'disputes', description: 'Submit evidence for dispute' },
    { code: 'disputes.evidence.read.self', module: 'disputes', description: 'View evidence for own dispute' },
    { code: 'disputes.reopen.self', module: 'disputes', description: 'Reopen own resolved dispute' },
    { code: 'disputes.read.organization', module: 'disputes', description: 'View all organization disputes' },
    { code: 'disputes.assign', module: 'disputes', description: 'Assign dispute to specialist' },
    { code: 'disputes.unassign', module: 'disputes', description: 'Unassign dispute from specialist' },
    { code: 'disputes.priority.update', module: 'disputes', description: 'Update dispute priority' },
    { code: 'disputes.investigate', module: 'disputes', description: 'Transition dispute through investigation states' },
    { code: 'disputes.escalate', module: 'disputes', description: 'Escalate dispute' },
    { code: 'disputes.resolve', module: 'disputes', description: 'Resolve dispute with financial settlement' },
    { code: 'disputes.reject', module: 'disputes', description: 'Reject dispute' },
    { code: 'disputes.evidence.read.organization', module: 'disputes', description: 'View all organization dispute evidence' },
    { code: 'disputes.evidence.review', module: 'disputes', description: 'Review and accept/reject dispute evidence' },

    // Reports & Audits
    { code: 'report.read', module: 'analytics', description: 'Access platform analytics and reports' },
    { code: 'audit.read', module: 'audit', description: 'Access audit trail logs' },
  ];

  const permIdMap: Record<string, string> = {};
  for (const p of permissionCodes) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: { module: p.module, description: p.description },
      create: { code: p.code, module: p.module, description: p.description },
    });
    permIdMap[p.code] = perm.id;
  }

  // Define Role -> Permission Matrix
  const rolePermissionMatrix: Record<string, string[]> = {
    ADMIN: permissionCodes.map((p) => p.code),
    OPERATIONS: [
      'organization.read',
      'user.read',
      'customer.read',
      'customer.update',
      'provider.read',
      'provider.update',
      'provider.approve',
      'provider.suspend',
      'delivery_partner.read',
      'delivery_partner.update',
      'delivery_partner.approve',
      'delivery_partner.suspend',
      'service.read',
      'service.create',
      'service.update',
      'service.archive',
      'booking.read',
      'booking.update',
      'booking.cancel',
      'assignment.read',
      'assignment.create',
      'assignment.update',
      'payment.read',
      'payments.read.organization',
      'payments.process',
      'payments.update',
      'payments.fail',
      'payments.cancel',
      'transactions.read.organization',
      'refund.create',
      'refunds.read.organization',
      'refunds.create',
      'refunds.process',
      'refunds.fail',
      'earning.read',
      'earnings.read.organization',
      'earnings.adjust',
      'earnings.process',
      'earnings.reverse',
      'financial.summary.organization',
      'coupons.read.organization',
      'coupons.create',
      'coupons.update',
      'coupons.activate',
      'coupons.pause',
      'coupons.disable',
      'coupons.redemptions.read',
      'offers.read.organization',
      'offers.create',
      'offers.update',
      'offers.activate',
      'offers.pause',
      'offers.disable',
      'offers.redemptions.read',
      'rewards.read.organization',
      'rewards.adjust',
      'rewards.reverse',
      'review.read',
      'review.moderate',
      'reviews.read.organization',
      'reviews.moderate',
      'reviews.publish',
      'reviews.hide',
      'reviews.reject',
      'reviews.restore',
      'reviews.moderation-history.read',
      'review-reports.read.organization',
      'review-reports.review',
      'review-reports.resolve',
      'review-reports.dismiss',
      'notification.read',
      'notification.manage',
      'notifications.read.organization',
      'notifications.broadcast.create',
      'notifications.templates.read',
      'notifications.templates.create',
      'notifications.templates.update',
      'communications.read.organization',
      'communications.create',
      'communications.retry',
      'communications.cancel',
      'notifications.read.self',
      'notifications.update.self',
      'notifications.preferences.read.self',
      'notifications.preferences.update.self',
      'communications.read.self',
      'support.read',
      'support.update',
      'support.read.organization',
      'support.message.organization',
      'support.assign',
      'support.unassign',
      'support.priority.update',
      'support.escalate',
      'support.resolve',
      'support.close',
      'support.notes.read',
      'support.notes.create',
      'support.create-dispute',
      'dispute.read',
      'dispute.update',
      'disputes.read.organization',
      'disputes.assign',
      'disputes.unassign',
      'disputes.priority.update',
      'disputes.investigate',
      'disputes.escalate',
      'disputes.resolve',
      'disputes.reject',
      'disputes.evidence.read.organization',
      'disputes.evidence.review',
      'report.read',
      'audit.read',
    ],
    SUPPORT_LEAD: [
      'user.read',
      'customer.read',
      'provider.read',
      'delivery_partner.read',
      'booking.read',
      'payment.read',
      'payments.read.organization',
      'refund.create',
      'refunds.read.organization',
      'refunds.create',
      'notification.read',
      'notifications.read.self',
      'support.read',
      'support.update',
      'support.read.organization',
      'support.message.organization',
      'support.assign',
      'support.unassign',
      'support.priority.update',
      'support.escalate',
      'support.resolve',
      'support.close',
      'support.notes.read',
      'support.notes.create',
      'support.create-dispute',
      'dispute.read',
      'dispute.update',
      'disputes.read.organization',
      'disputes.assign',
      'disputes.unassign',
      'disputes.priority.update',
      'disputes.investigate',
      'disputes.escalate',
      'disputes.resolve',
      'disputes.reject',
      'disputes.evidence.read.organization',
      'disputes.evidence.review',
    ],
    SUPPORT_AGENT: [
      'user.read',
      'customer.read',
      'provider.read',
      'delivery_partner.read',
      'booking.read',
      'payment.read',
      'notification.read',
      'notifications.read.self',
      'support.read',
      'support.update',
      'support.read.organization',
      'support.message.organization',
      'support.assign',
      'support.unassign',
      'support.priority.update',
      'support.escalate',
      'support.resolve',
      'support.close',
      'support.notes.read',
      'support.notes.create',
      'support.create-dispute',
      'dispute.read',
      'dispute.update',
      'disputes.read.organization',
      'disputes.assign',
      'disputes.priority.update',
      'disputes.investigate',
      'disputes.escalate',
      'disputes.resolve',
      'disputes.reject',
      'disputes.evidence.read.organization',
      'disputes.evidence.review',
    ],
    CUSTOMER: [
      'customer.read.self',
      'customer.update.self',
      'booking.read.self',
      'booking.create.self',
      'booking.update.self',
      'booking.cancel.self',
      'payments.read.self',
      'payments.create.self',
      'transactions.read.self',
      'refunds.read.self',
      'financial.summary.self',
      'rewards.read.self',
      'rewards.redeem.self',
      'review.read.self',
      'review.create.self',
      'reviews.read.self',
      'reviews.create.self',
      'reviews.update.self',
      'reviews.withdraw.self',
      'reviews.report',
      'review-reports.create',
      'notification.read.self',
      'notification.update.self',
      'notifications.read.self',
      'notifications.update.self',
      'notifications.preferences.read.self',
      'notifications.preferences.update.self',
      'communications.read.self',
      'support.create.self',
      'support.read.self',
      'support.message.self',
      'support.reopen.self',
      'disputes.create.self',
      'disputes.read.self',
      'disputes.message.self',
      'disputes.evidence.create.self',
      'disputes.evidence.read.self',
      'disputes.reopen.self',
    ],
    PROVIDER: [
      'provider.read.self',
      'provider.update.self',
      'service.read',
      'booking.read.assigned',
      'booking.update.assigned',
      'assignment.read.self',
      'earning.read.self',
      'earnings.read.self',
      'financial.summary.self',
      'review.read.self',
      'reviews.read.self',
      'review-responses.read.self',
      'review-responses.create.self',
      'review-responses.update.self',
      'review-responses.delete.self',
      'notification.read.self',
      'notifications.read.self',
      'notifications.update.self',
      'notifications.preferences.read.self',
      'notifications.preferences.update.self',
      'communications.read.self',
      'support.create.self',
      'support.read.self',
      'support.message.self',
      'support.reopen.self',
      'disputes.read.self',
      'disputes.message.self',
      'disputes.evidence.create.self',
      'disputes.evidence.read.self',
    ],
    DELIVERY_PARTNER: [
      'delivery_partner.read.self',
      'delivery_partner.update.self',
      'booking.read.assigned',
      'assignment.read.self',
      'assignment.update.self',
      'earning.read.self',
      'earnings.read.self',
      'financial.summary.self',
      'notification.read.self',
      'notifications.read.self',
      'notifications.update.self',
      'notifications.preferences.read.self',
      'notifications.preferences.update.self',
      'communications.read.self',
      'support.create.self',
      'support.read.self',
      'support.message.self',
      'support.reopen.self',
      'disputes.read.self',
      'disputes.message.self',
      'disputes.evidence.create.self',
      'disputes.evidence.read.self',
    ],
  };

  for (const [roleType, permList] of Object.entries(rolePermissionMatrix)) {
    const roleId = roleMap[roleType];
    if (!roleId) continue;

    for (const permCode of permList) {
      const permissionId = permIdMap[permCode];
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  // 2. ORGANIZATIONS
  console.log('🏢 Seeding Organizations (ORG-0001 & ORG-0002)...');
  const org1 = await prisma.organization.upsert({
    where: { publicId: ORG_1_PUBLIC_ID },
    update: {
      name: 'LuxeCare Hub Chennai',
      email: 'ops-chennai@washora.com',
      phone: '+919840012345',
      city: 'Chennai',
      state: 'Tamil Nadu',
    },
    create: {
      publicId: ORG_1_PUBLIC_ID,
      name: 'LuxeCare Hub Chennai',
      email: 'ops-chennai@washora.com',
      phone: '+919840012345',
      type: 'WASHORA',
      status: 'ACTIVE',
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: 'Plot 42, OMR IT Corridor, Sholinganallur',
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { publicId: ORG_2_PUBLIC_ID },
    update: {
      name: 'Metro Wash Operations Coimbatore',
      email: 'ops-coimbatore@washora.com',
      phone: '+919840067890',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
    },
    create: {
      publicId: ORG_2_PUBLIC_ID,
      name: 'Metro Wash Operations Coimbatore',
      email: 'ops-coimbatore@washora.com',
      phone: '+919840067890',
      type: 'PARTNER_ORGANIZATION',
      status: 'ACTIVE',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      address: 'Avinashi Road, Peelamedu',
    },
  });

  // 3. STAFF USERS & ORGANIZATION MEMBERS
  console.log('👥 Seeding Staff Users & Organization Members...');
  const staffMembers = [
    { email: 'admin@example.com', name: 'Karthik Raja', role: 'ADMIN', org: org1, phone: '+919840100001' },
    { email: 'ops@example.com', name: 'Priya Sundaram', role: 'OPERATIONS', org: org1, phone: '+919840100002' },
    { email: 'finance@example.com', name: 'Venkatesh Iyer', role: 'FINANCE_ADMIN', org: org1, phone: '+919840100003' },
    { email: 'support.lead@example.com', name: 'Ananya Ramesh', role: 'SUPPORT_LEAD', org: org1, phone: '+919840100004' },
    { email: 'support.agent1@example.com', name: 'Dinesh Kumar', role: 'SUPPORT_AGENT', org: org1, phone: '+919840100005' },
    { email: 'support.agent2@example.com', name: 'Meera Krishnan', role: 'SUPPORT_AGENT', org: org1, phone: '+919840100006' },
    { email: 'cbe.admin@example.com', name: 'Suresh Babu', role: 'ADMIN', org: org2, phone: '+919840200001' },
    { email: 'cbe.ops@example.com', name: 'Deepa Natarajan', role: 'OPERATIONS', org: org2, phone: '+919840200002' },
  ];

  const staffUserMap: Record<string, { userId: string; orgId: string }> = {};
  for (const s of staffMembers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { phone: s.phone },
      create: {
        email: s.email,
        passwordHash: '$2b$10$epRfZW5fP4pXyqJ3T7NlxeD6.9Akm/Wq3Gz4R5pI8M0K7L1Y2O4qW', // "Admin@123"
        phone: s.phone,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      },
    });

    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: s.org.id, userId: user.id } },
      update: { roleId: roleMap[s.role], fullName: s.name, phone: s.phone },
      create: {
        organizationId: s.org.id,
        userId: user.id,
        roleId: roleMap[s.role],
        fullName: s.name,
        phone: s.phone,
        primaryWorkArea: 'PLATFORM',
        preferredLanguage: 'ENGLISH',
        status: 'ACTIVE',
      },
    });

    staffUserMap[s.email] = { userId: user.id, orgId: s.org.id };
  }

  // 4. SERVICE CATEGORIES & SERVICES (15+ Categories, 50+ Services, 100+ Variants)
  console.log('🏷️ Seeding Service Categories, Services & Variants...');
  const categoryDefs = [
    { slug: 'wash-fold', name: 'Wash & Fold', icon: 'Sparkles', desc: 'Everyday laundry washed, dried, and neatly folded' },
    { slug: 'wash-iron', name: 'Wash & Iron', desc: 'Complete wash with steam iron finish', icon: 'Shirt' },
    { slug: 'premium-laundry', name: 'Premium Laundry', desc: 'Luxury garments with specialized care and eco-detergents', icon: 'Crown' },
    { slug: 'dry-cleaning', name: 'Dry Cleaning', desc: 'Delicate fabrics, suits, blazers, and designer wear', icon: 'Sparkles' },
    { slug: 'shoe-care', name: 'Shoe Care & Restoration', desc: 'Deep cleaning, deodorization, and sole whitening for sneakers', icon: 'Footprints' },
    { slug: 'curtain-cleaning', name: 'Curtain & Drapery Care', desc: 'Drapes, blackout curtains, and sheer panels', icon: 'Home' },
    { slug: 'bedding-linen', name: 'Bedding & Linen', desc: 'Bedsheets, duvet covers, quilts, and pillowcases', icon: 'Bed' },
    { slug: 'leather-suede', name: 'Leather & Suede Care', desc: 'Jackets, bags, and luxury leather restoration', icon: 'Shield' },
    { slug: 'stain-removal', name: 'Intensive Stain Removal', desc: 'Targeted enzyme treatments for oil, ink, and grease', icon: 'Wand2' },
    { slug: 'express-wash', name: 'Express Same-Day Wash', desc: 'Quick 6-8 hour turnaround laundry service', icon: 'Zap' },
    { slug: 'commercial-linen', name: 'Commercial & Hospitality', desc: 'Bulk laundry for clinics, hotels, and hostels', icon: 'Building' },
    { slug: 'traditional-wear', name: 'Traditional & Ethnic Wear', desc: 'Silk sarees, sherwanis, and zari embroidered lehengas', icon: 'Flame' },
    { slug: 'carpet-rugs', name: 'Carpet & Rug Cleaning', desc: 'Deep extraction washing for area rugs and carpets', icon: 'Layers' },
    { slug: 'baby-wear', name: 'Baby Care & Hypoallergenic', desc: 'Gentle organic wash with dermatologist-approved soap', icon: 'Heart' },
    { slug: 'winter-wear', name: 'Winter Wear & Woolens', desc: 'Sweaters, trench coats, thermal garments, and cardigans', icon: 'Sun' },
    { slug: 'sneaker-spa', name: 'Sneaker Spa & Deodorizing', desc: 'Premium sneaker revival and antimicrobial treatment', icon: 'Zap' },
  ];

  const orgs = [org1, org2];
  const allServices: { id: string; orgId: string; name: string; basePrice: Prisma.Decimal }[] = [];

  for (const org of orgs) {
    let catIndex = 1;
    for (const catDef of categoryDefs) {
      const catPublicId = `CAT-${org.publicId.slice(-4)}-${String(catIndex).padStart(4, '0')}`;
      const category = await prisma.serviceCategory.upsert({
        where: { organizationId_slug: { organizationId: org.id, slug: catDef.slug } },
        update: { name: catDef.name, description: catDef.desc },
        create: {
          publicId: catPublicId,
          organizationId: org.id,
          name: catDef.name,
          slug: catDef.slug,
          description: catDef.desc,
          displayOrder: catIndex,
          status: 'ACTIVE',
        },
      });

      // 3-4 Services per Category
      for (let sIdx = 1; sIdx <= 3; sIdx++) {
        const svcPublicId = `SVC-${org.publicId.slice(-4)}-${String((catIndex - 1) * 3 + sIdx).padStart(4, '0')}`;
        const svcSlug = `${catDef.slug}-tier-${sIdx}`;
        const svcName = `${catDef.name} - Tier ${sIdx}`;
        const basePrice = new Prisma.Decimal(69.00 * sIdx + 20);

        const service = await prisma.service.upsert({
          where: { organizationId_slug: { organizationId: org.id, slug: svcSlug } },
          update: { name: svcName, basePrice },
          create: {
            publicId: svcPublicId,
            organizationId: org.id,
            categoryId: category.id,
            name: svcName,
            slug: svcSlug,
            tagline: `Professional ${catDef.name.toLowerCase()} for daily convenience`,
            description: `Complete hygienic care with fabric softening and automated drying.`,
            basePrice,
            unit: sIdx === 1 ? 'kg' : 'piece',
            turnaroundHours: sIdx === 3 ? 12 : 24,
            isFeatured: sIdx === 1,
            rating: new Prisma.Decimal(4.8),
            totalReviews: 25,
            status: 'ACTIVE',
          },
        });

        allServices.push({ id: service.id, orgId: org.id, name: svcName, basePrice });

        // 2 Variants per Service
        for (let vIdx = 1; vIdx <= 2; vIdx++) {
          const varPublicId = `VAR-${svcPublicId.slice(4)}-${vIdx}`;
          const varName = vIdx === 1 ? 'Standard Gentle Cycle' : 'Express Eco-Care';
          await prisma.serviceVariant.upsert({
            where: { organizationId_publicId: { organizationId: org.id, publicId: varPublicId } },
            update: { name: varName },
            create: {
              publicId: varPublicId,
              organizationId: org.id,
              serviceId: service.id,
              name: varName,
              priceMultiplier: new Prisma.Decimal(vIdx === 1 ? 1.00 : 1.30),
              additionalPrice: new Prisma.Decimal(vIdx === 1 ? 0.00 : 30.00),
              turnaroundHours: vIdx === 1 ? 24 : 12,
              status: 'ACTIVE',
            },
          });
        }
      }
      catIndex++;
    }
  }

  // 5. CUSTOMERS (50+ total: 35 in Org1, 15 in Org2)
  console.log('👤 Seeding Customers & Addresses (50+ Customers)...');
  const customerList: { id: string; orgId: string; userId: string; publicId: string; name: string }[] = [];
  const customerNames = [
    'Aarav Sharma', 'Aditi Verma', 'Akash Sundar', 'Ananya Deshmukh', 'Balaji Rao',
    'Bhavna Patel', 'Chetan Bhagat', 'Deepika Padukone', 'Divya Nair', 'Eashwar Moorthy',
    'Farhan Akhtar', 'Gautam Gambhir', 'Harini Sekar', 'Indira Priyadarshini', 'Jayanthi Natarajan',
    'Kavitha Menon', 'Lakshmi Prasanna', 'Manoj Bajpayee', 'Naveen Polishetty', 'Oviya Helen',
    'Pooja Hegde', 'Raghavendra Lawrence', 'Sai Pallavi', 'Tarun Tahiliani', 'Udhayanidhi Stalin',
    'Varun Dhawan', 'Yamini Krishnamurthy', 'Zoya Akhtar', 'Abhinav Bindra', 'Bhuvneshwar Kumar',
    'Charulatha V', 'Dhanush Raja', 'Elango Kumar', 'Fathima Beevi', 'Girish Karnad',
    'Hariharan Ananth', 'Ishwarya Rai', 'Jeeva Ravi', 'Keerthy Suresh', 'Lokesh Kanagaraj',
    'Manju Warrier', 'Nivin Pauly', 'Prithviraj Sukumaran', 'Radhika Sarathkumar', 'Suriya Sivakumar',
    'Trisha Krishnan', 'Vijay Sethupathi', 'Vikram Kennedy', 'Yash Gowda', 'Ajith Kumar'
  ];

  for (let i = 0; i < customerNames.length; i++) {
    const org = i < 35 ? org1 : org2;
    const email = `customer${i + 1}@washora.test`;
    const phone = `+9198411${String(i + 1).padStart(5, '0')}`;
    const pubId = `CUS-${org.publicId.slice(-4)}-${String(i + 1).padStart(4, '0')}`;
    const name = customerNames[i];

    const user = await prisma.user.upsert({
      where: { email },
      update: { phone },
      create: {
        email,
        passwordHash: '$2b$10$epRfZW5fP4pXyqJ3T7NlxeD6.9Akm/Wq3Gz4R5pI8M0K7L1Y2O4qW',
        phone,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      },
    });

    const customer = await prisma.customer.upsert({
      where: { organizationId_publicId: { organizationId: org.id, publicId: pubId } },
      update: { fullName: name, email, phone },
      create: {
        publicId: pubId,
        organizationId: org.id,
        userId: user.id,
        fullName: name,
        email,
        phone,
        membershipTier: i % 5 === 0 ? 'ELITE' : i % 3 === 0 ? 'PREMIUM' : 'STANDARD',
        status: 'ACTIVE',
      },
    });

    customerList.push({ id: customer.id, orgId: org.id, userId: user.id, publicId: pubId, name });

    // Customer Address
    await prisma.customerAddress.upsert({
      where: { id: customer.id }, // dummy deterministic check
      update: {},
      create: {
        id: customer.id,
        customerId: customer.id,
        organizationId: org.id,
        label: 'HOME',
        recipientName: name,
        recipientPhone: phone,
        addressLine1: `Apartment #${101 + i}, Prestige Bella Vista`,
        area: i < 35 ? 'Adyar' : 'R.S. Puram',
        city: org.city || 'Chennai',
        state: 'Tamil Nadu',
        postalCode: i < 35 ? '600020' : '641002',
        isDefault: true,
        status: 'ACTIVE',
      },
    });

    // Customer Reward Account & Reconciled Transactions (550+ transactions total)
    const txList = [
      { type: 'EARNED' as const, points: 250, desc: 'Welcome loyalty reward bonus points' },
      { type: 'EARNED' as const, points: 100, desc: 'Reward points earned on booking #1' },
      { type: 'EARNED' as const, points: 150, desc: 'Reward points earned on booking #2' },
      { type: 'REDEEMED' as const, points: -100, desc: 'Redeemed 100 points for ₹10 discount' },
      { type: 'EARNED' as const, points: 80, desc: 'Reward points earned on booking #3' },
      { type: 'REDEEMED' as const, points: -50, desc: 'Redeemed 50 points for ₹5 discount' },
      { type: 'ADJUSTED' as const, points: 50, desc: 'Courtesy service credit adjustment' },
      { type: 'EARNED' as const, points: 120, desc: 'Reward points earned on booking #4' },
      { type: 'REDEEMED' as const, points: -80, desc: 'Redeemed 80 points for ₹8 discount' },
      { type: 'REFUNDED' as const, points: 80, desc: 'Reversal of points redemption due to booking cancellation' },
      { type: 'EARNED' as const, points: 50, desc: 'Reward points earned on booking #5' },
    ];

    let currentBalance = 0;
    let lifetimeEarned = 0;
    let lifetimeRedeemed = 0;

    for (const t of txList) {
      currentBalance += t.points;
      if (t.points > 0 && t.type !== 'REFUNDED') {
        lifetimeEarned += t.points;
      } else if (t.points < 0) {
        lifetimeRedeemed += Math.abs(t.points);
      }
    }

    const rewardAccount = await prisma.customerRewardAccount.upsert({
      where: { customerId: customer.id },
      update: {
        pointsBalance: currentBalance,
        lifetimeEarned,
        lifetimeRedeemed,
      },
      create: {
        customerId: customer.id,
        organizationId: org.id,
        pointsBalance: currentBalance,
        lifetimeEarned,
        lifetimeRedeemed,
      },
    });

    let runningBalance = 0;
    for (const tx of txList) {
      runningBalance += tx.points;
      await prisma.customerRewardTransaction.create({
        data: {
          rewardAccountId: rewardAccount.id,
          customerId: customer.id,
          organizationId: org.id,
          type: tx.type,
          points: tx.points,
          balanceAfter: runningBalance,
          description: tx.desc,
        },
      });
    }
  }

  // 6. PROVIDERS (30+ total: 22 in Org1, 8 in Org2)
  console.log('🏪 Seeding Service Providers / Studios (30+ Providers)...');
  const providerList: { id: string; orgId: string; userId: string; publicId: string; name: string }[] = [];
  const studioNames = [
    'CleanCare Prime Studio', 'VelvetTouch Fabric Studio', 'SparkleDry Express Lab',
    'Aura Garment Care', 'Pristine Steam & Dry', 'Royal Blue Laundry Lounge',
    'EcoClean Organic Care', 'Lotus Bloom Dry Cleaners', 'Heritage Silk Wash House',
    'Metro Shine Studio', 'Zenith Fabric Spa', 'Master Cleaners Guild',
    'Silk & Cotton Specialists', 'Urban Fresh Laundry Lab', 'Apex Cleaners Hub',
    'Grand Steam Works', 'Prestige Wash Studio', 'Ocean Blue Cleaners',
    'Elite Care Workshop', 'Green Earth Eco Wash', 'Sapphire Care Lounge',
    'Silver Star Laundry', 'Coimbatore Cotton Hub', 'Kovai Fresh Garment Care',
    'Siruvani Eco Laundry', 'Kongu Steam Works', 'Textile City Cleaners',
    'Marutham Dry Care', 'Anamalai Fabric Spa', 'Nilgiri Clean Studio'
  ];

  for (let i = 0; i < studioNames.length; i++) {
    const org = i < 22 ? org1 : org2;
    const email = `provider${i + 1}@washora.test`;
    const phone = `+9198422${String(i + 1).padStart(5, '0')}`;
    const pubId = `PRO-${org.publicId.slice(-4)}-${String(i + 1).padStart(4, '0')}`;
    const name = studioNames[i];

    const user = await prisma.user.upsert({
      where: { email },
      update: { phone },
      create: {
        email,
        passwordHash: '$2b$10$epRfZW5fP4pXyqJ3T7NlxeD6.9Akm/Wq3Gz4R5pI8M0K7L1Y2O4qW',
        phone,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      },
    });

    const provider = await prisma.provider.upsert({
      where: { organizationId_publicId: { organizationId: org.id, publicId: pubId } },
      update: { businessName: name, fullName: `${name} Manager`, email, phone },
      create: {
        publicId: pubId,
        organizationId: org.id,
        userId: user.id,
        businessName: name,
        fullName: `${name} Manager`,
        email,
        phone,
        city: org.city || 'Chennai',
        address: `${12 + i}, Industrial Estate Phase ${1 + (i % 3)}`,
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        rating: new Prisma.Decimal(4.85),
        totalReviews: 40 + i * 2,
        totalBookings: 80 + i * 5,
        completedBookings: 75 + i * 5,
        totalEarnings: new Prisma.Decimal(45000.00 + i * 1500),
      },
    });

    providerList.push({ id: provider.id, orgId: org.id, userId: user.id, publicId: pubId, name });

    // Link Provider to Services in Org
    const orgServices = allServices.filter(s => s.orgId === org.id);
    for (let s = 0; s < Math.min(orgServices.length, 5); s++) {
      await prisma.providerService.upsert({
        where: { providerId_serviceId: { providerId: provider.id, serviceId: orgServices[s].id } },
        update: {},
        create: {
          providerId: provider.id,
          organizationId: org.id,
          serviceId: orgServices[s].id,
          customPrice: orgServices[s].basePrice,
          status: 'ACTIVE',
        },
      });
    }

    // Provider Availability (Monday to Saturday)
    for (let day = 1; day <= 6; day++) {
      await prisma.providerAvailability.upsert({
        where: { providerId_dayOfWeek: { providerId: provider.id, dayOfWeek: day } },
        update: {},
        create: {
          providerId: provider.id,
          organizationId: org.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '20:00',
          isAvailable: true,
          maxDailyOrders: 40,
        },
      });
    }
  }

  // 7. DELIVERY PARTNERS (25+ total: 18 in Org1, 7 in Org2)
  console.log('🛵 Seeding Delivery Partners / Valets (25+ Valets)...');
  const deliveryPartnerList: { id: string; orgId: string; userId: string; publicId: string; name: string }[] = [];
  const valetNames = [
    'Murugan Selvan', 'Senthil Nathan', 'Karthikeyan P', 'Manikandan V', 'Suresh Rainaa',
    'Dinesh Karthick', 'Vijay Anand', 'Saravanan R', 'Ramesh Aravind', 'Praveen Kumar',
    'Gokul Nath', 'Thirumalai Swamy', 'Muthuvel Karuna', 'Pandian C', 'Ganesh Moorthy',
    'Rajesh Kannan', 'Bala Subramani', 'Vignesh Shivan', 'Kovai Mani', 'Shanmuga Sundaram',
    'Periyasamy V', 'Velusamy K', 'Chinnasamy R', 'Sundaramurthy M', 'Kathirvelan S'
  ];

  for (let i = 0; i < valetNames.length; i++) {
    const org = i < 18 ? org1 : org2;
    const email = `valet${i + 1}@washora.test`;
    const phone = `+9198433${String(i + 1).padStart(5, '0')}`;
    const pubId = `DLP-${org.publicId.slice(-4)}-${String(i + 1).padStart(4, '0')}`;
    const name = valetNames[i];

    const user = await prisma.user.upsert({
      where: { email },
      update: { phone },
      create: {
        email,
        passwordHash: '$2b$10$epRfZW5fP4pXyqJ3T7NlxeD6.9Akm/Wq3Gz4R5pI8M0K7L1Y2O4qW',
        phone,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      },
    });

    const partner = await prisma.deliveryPartner.upsert({
      where: { organizationId_publicId: { organizationId: org.id, publicId: pubId } },
      update: { fullName: name, email, phone },
      create: {
        publicId: pubId,
        organizationId: org.id,
        userId: user.id,
        fullName: name,
        email,
        phone,
        city: org.city || 'Chennai',
        vehicleType: i % 4 === 0 ? 'EV_2W' : i % 3 === 0 ? 'SCOOTER' : 'BIKE',
        vehicleNumber: `TN-${i < 18 ? '07' : '38'}-AB-${1000 + i}`,
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        rating: new Prisma.Decimal(4.90),
        totalDeliveries: 120 + i * 10,
        completedDeliveries: 118 + i * 10,
        totalEarnings: new Prisma.Decimal(18500.00 + i * 600),
      },
    });

    deliveryPartnerList.push({ id: partner.id, orgId: org.id, userId: user.id, publicId: pubId, name });
  }

  // 8. BOOKINGS & FINANCIAL TRANSACTIONS (200+ Bookings)
  console.log('📋 Seeding Bookings, Payments, Ledger & Reviews (280 Bookings, 220 Completed)...');
  const bookingStatuses: ('COMPLETED' | 'CONFIRMED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED')[] = [
    'COMPLETED', 'CONFIRMED', 'IN_PROGRESS', 'PENDING', 'CANCELLED'
  ];

  for (let bIdx = 1; bIdx <= 280; bIdx++) {
    const isOrg1 = bIdx <= 200;
    const org = isOrg1 ? org1 : org2;
    const orgCustomers = customerList.filter(c => c.orgId === org.id);
    const orgProviders = providerList.filter(p => p.orgId === org.id);
    const orgValets = deliveryPartnerList.filter(v => v.orgId === org.id);
    const orgServices = allServices.filter(s => s.orgId === org.id);

    const customer = orgCustomers[bIdx % orgCustomers.length];
    const provider = orgProviders[bIdx % orgProviders.length];
    const valet = orgValets[bIdx % orgValets.length];
    const service = orgServices[bIdx % orgServices.length];

    const status = bIdx <= 220 ? 'COMPLETED' : bookingStatuses[(bIdx - 221) % bookingStatuses.length];
    const bookingNumber = `WAS-2026-${String(bIdx).padStart(6, '0')}`;

    const subtotal = new Prisma.Decimal(249.00 + (bIdx % 10) * 50);
    const serviceFee = new Prisma.Decimal(25.00);
    const taxAmount = new Prisma.Decimal(18.00);
    const discountAmount = new Prisma.Decimal(bIdx % 4 === 0 ? 30.00 : 0.00);
    const rewardDiscount = new Prisma.Decimal(0.00);
    const totalAmount = subtotal.add(serviceFee).add(taxAmount).sub(discountAmount).sub(rewardDiscount);

    const booking = await prisma.booking.upsert({
      where: { organizationId_bookingNumber: { organizationId: org.id, bookingNumber } },
      update: { status, totalAmount },
      create: {
        bookingNumber,
        organizationId: org.id,
        customerId: customer.id,
        providerId: provider.id,
        serviceId: service.id,
        status,
        subtotal,
        serviceFee,
        taxAmount,
        discountAmount,
        rewardDiscount,
        totalAmount,
        currency: 'INR',
        scheduledAt: new Date(Date.now() - (220 - bIdx) * 3600 * 1000 * 4),
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    // Booking Items (Historical Snapshot)
    await prisma.bookingItem.create({
      data: {
        bookingId: booking.id,
        organizationId: org.id,
        serviceNameSnapshot: service.name,
        variantNameSnapshot: 'Standard Gentle Cycle',
        unitPrice: service.basePrice,
        quantity: 2,
        serviceFee: new Prisma.Decimal(12.50),
        discountAmount: new Prisma.Decimal(0.00),
        totalAmount: subtotal,
      },
    });

    // Booking Address Snapshot
    await prisma.bookingAddress.upsert({
      where: { bookingId: booking.id },
      update: {},
      create: {
        bookingId: booking.id,
        organizationId: org.id,
        recipientName: customer.name,
        recipientPhone: '+919840112233',
        addressLine1: `Flat ${bIdx}, Royal Residency`,
        area: isOrg1 ? 'Adyar' : 'R.S. Puram',
        city: org.city || 'Chennai',
        state: 'Tamil Nadu',
        postalCode: isOrg1 ? '600020' : '641002',
      },
    });

    // Payment & Ledger Transaction
    if (status === 'PENDING') {
      const payPublicId = `PAY-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
      const payment = await prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: { status: 'PENDING' },
        create: {
          publicId: payPublicId,
          bookingId: booking.id,
          organizationId: org.id,
          amount: totalAmount,
          currency: 'INR',
          method: 'UPI',
          status: 'PENDING',
          gatewayName: 'MOCK',
        },
      });

      const txnPublicId = `TXN-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
      await prisma.transaction.upsert({
        where: { organizationId_publicId: { organizationId: org.id, publicId: txnPublicId } },
        update: {},
        create: {
          publicId: txnPublicId,
          organizationId: org.id,
          bookingId: booking.id,
          paymentId: payment.id,
          type: 'PAYMENT',
          amount: totalAmount,
          currency: 'INR',
          status: 'PENDING',
          description: `Order payment initiation for ${bookingNumber}`,
        },
      });
    } else if (status === 'CANCELLED') {
      const payPublicId = `PAY-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
      const payment = await prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: { status: 'FAILED' },
        create: {
          publicId: payPublicId,
          bookingId: booking.id,
          organizationId: org.id,
          amount: totalAmount,
          currency: 'INR',
          method: 'CARD',
          status: 'FAILED',
          gatewayName: 'MOCK',
          failureReason: 'Booking cancelled before service pickup',
        },
      });

      const txnPublicId = `TXN-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
      await prisma.transaction.upsert({
        where: { organizationId_publicId: { organizationId: org.id, publicId: txnPublicId } },
        update: {},
        create: {
          publicId: txnPublicId,
          organizationId: org.id,
          bookingId: booking.id,
          paymentId: payment.id,
          type: 'PAYMENT',
          amount: totalAmount,
          currency: 'INR',
          status: 'FAILED',
          description: `Failed payment for cancelled ${bookingNumber}`,
        },
      });
    } else {
      // COMPLETED, CONFIRMED, IN_PROGRESS
      const isFullRefund = bIdx % 25 === 0;
      const isPartialRefund = bIdx % 25 === 1;
      const paymentStatus = isFullRefund ? 'REFUNDED' : isPartialRefund ? 'PARTIALLY_REFUNDED' : 'PAID';

      const payPublicId = `PAY-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
      const payment = await prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: { status: paymentStatus },
        create: {
          publicId: payPublicId,
          bookingId: booking.id,
          organizationId: org.id,
          amount: totalAmount,
          currency: 'INR',
          method: bIdx % 3 === 0 ? 'UPI' : 'CARD',
          status: paymentStatus,
          gatewayRef: `mock_order_${100000 + bIdx}`,
          gatewayName: 'MOCK',
          paidAt: new Date(),
        },
      });

      const txnPublicId = `TXN-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
      const payTxn = await prisma.transaction.upsert({
        where: { organizationId_publicId: { organizationId: org.id, publicId: txnPublicId } },
        update: {},
        create: {
          publicId: txnPublicId,
          organizationId: org.id,
          bookingId: booking.id,
          paymentId: payment.id,
          type: 'PAYMENT',
          amount: totalAmount,
          currency: 'INR',
          status: 'COMPLETED',
          description: `Order payment capture for ${bookingNumber}`,
        },
      });

      // Handle Refunds if applicable
      if (isFullRefund || isPartialRefund) {
        const refundAmount = isFullRefund ? totalAmount : totalAmount.mul(0.3).toDecimalPlaces(2);
        const refPublicId = `REF-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
        const refTxnPublicId = `TXN-${org.publicId.slice(-4)}-REF-${String(bIdx).padStart(4, '0')}`;

        const refTxn = await prisma.transaction.upsert({
          where: { organizationId_publicId: { organizationId: org.id, publicId: refTxnPublicId } },
          update: {},
          create: {
            publicId: refTxnPublicId,
            organizationId: org.id,
            bookingId: booking.id,
            paymentId: payment.id,
            type: 'REFUND',
            amount: refundAmount,
            currency: 'INR',
            status: 'COMPLETED',
            description: `Customer refund for ${bookingNumber}`,
          },
        });

        await prisma.refund.upsert({
          where: { organizationId_publicId: { organizationId: org.id, publicId: refPublicId } },
          update: {},
          create: {
            publicId: refPublicId,
            organizationId: org.id,
            bookingId: booking.id,
            paymentId: payment.id,
            transactionId: refTxn.id,
            amount: refundAmount,
            currency: 'INR',
            status: 'PROCESSED',
            reason: isFullRefund ? 'Order cancellation refund' : 'Customer satisfaction adjustment',
            processedAt: new Date(),
          },
        });
      }

      // Earning & Earning Transactions for Provider
      const grossEarning = subtotal;
      const platformFee = subtotal.mul(0.15).toDecimalPlaces(2); // 15% platform commission
      const netEarning = grossEarning.sub(platformFee);
      const ernPublicId = `ERN-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;

      const earning = await prisma.earning.upsert({
        where: { organizationId_publicId: { organizationId: org.id, publicId: ernPublicId } },
        update: {},
        create: {
          publicId: ernPublicId,
          organizationId: org.id,
          bookingId: booking.id,
          providerId: provider.id,
          grossAmount: grossEarning,
          platformFee,
          netAmount: netEarning,
          currency: 'INR',
          status: status === 'COMPLETED' ? 'AVAILABLE' : 'PENDING',
        },
      });

      // Breakdowns
      await prisma.earningTransaction.create({
        data: {
          earningId: earning.id,
          organizationId: org.id,
          transactionId: payTxn.id,
          type: 'ORDER_CREDIT',
          amount: grossEarning,
          currency: 'INR',
          notes: 'Gross booking credit',
        },
      });

      await prisma.earningTransaction.create({
        data: {
          earningId: earning.id,
          organizationId: org.id,
          transactionId: payTxn.id,
          type: 'COMMISSION_DEDUCTION',
          amount: platformFee,
          currency: 'INR',
          notes: 'Platform 15% commission fee',
        },
      });

      // Operational Assignment & Delivery Partner Earning
      const asnPublicId = `ASN-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
      await prisma.bookingAssignment.upsert({
        where: { organizationId_publicId: { organizationId: org.id, publicId: asnPublicId } },
        update: {},
        create: {
          publicId: asnPublicId,
          bookingId: booking.id,
          organizationId: org.id,
          providerId: provider.id,
          deliveryPartnerId: valet.id,
          type: 'PROVIDER',
          status: status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED',
        },
      });

      if (status === 'COMPLETED') {
        const valErnPublicId = `ERN-${org.publicId.slice(-4)}-VAL-${String(bIdx).padStart(4, '0')}`;
        const deliveryFee = new Prisma.Decimal(50.0);
        await prisma.earning.upsert({
          where: { organizationId_publicId: { organizationId: org.id, publicId: valErnPublicId } },
          update: {},
          create: {
            publicId: valErnPublicId,
            organizationId: org.id,
            bookingId: booking.id,
            deliveryPartnerId: valet.id,
            grossAmount: deliveryFee,
            platformFee: new Prisma.Decimal(0),
            netAmount: deliveryFee,
            currency: 'INR',
            status: 'AVAILABLE',
          },
        });
      }
    }

    // Review for Completed Bookings (B12: 200+ Reviews across Completed Bookings)
    if (status === 'COMPLETED') {
      const revPublicId = `REV-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
      
      let reviewStatus: 'PUBLISHED' | 'PENDING' | 'HIDDEN' | 'REJECTED' | 'WITHDRAWN' = 'PUBLISHED';
      let title = 'Excellent fabric care and crisp finish';
      let comment = 'The garments were cleaned with great attention to detail. Fast turnaround and polite delivery!';
      let rating = ((bIdx * 3) % 3) + 3; // 3, 4, 5
      let publishedAt: Date | null = new Date(Date.now() - (280 - bIdx) * 3600 * 1000);
      let moderatedAt: Date | null = publishedAt;
      let moderatedBy: string | null = staffUserMap[isOrg1 ? 'admin@example.com' : 'cbe.admin@example.com'].userId;
      let moderationReason: string | null = 'Standard content policy compliance';

      if (bIdx > 165 && bIdx <= 185) {
        reviewStatus = 'PENDING';
        title = 'Fresh clean clothes and good packaging';
        comment = 'Satisfied with the booking overall. Waiting for moderation.';
        publishedAt = null;
        moderatedAt = null;
        moderatedBy = null;
        moderationReason = null;
      } else if (bIdx > 185 && bIdx <= 198) {
        reviewStatus = 'HIDDEN';
        rating = 2;
        title = 'Delivery delay issue please call me';
        comment = 'My order was delayed by 3 hours. Call me at 9840112233 immediately.';
        moderationReason = 'Hidden due to personal telephone number in review content';
      } else if (bIdx > 198 && bIdx <= 209) {
        reviewStatus = 'REJECTED';
        rating = 1;
        title = 'Spam promotional external links';
        comment = 'Check out discount laundry vouchers at external-spam-portal.com!';
        moderationReason = 'Rejected due to promotional spam and external links';
      } else if (bIdx > 209 && bIdx <= 220) {
        reviewStatus = 'WITHDRAWN';
        title = 'Issue resolved directly with support';
        comment = 'Withdrawing this review as the provider has compensated for the issue.';
      }

      const review = await prisma.review.upsert({
        where: { bookingId: booking.id },
        update: {
          status: reviewStatus,
          title,
          comment,
          rating,
          publishedAt,
          moderatedAt,
          moderatedBy,
          moderationReason,
        },
        create: {
          publicId: revPublicId,
          bookingId: booking.id,
          organizationId: org.id,
          customerId: customer.id,
          providerId: provider.id,
          serviceId: service.id,
          rating,
          title,
          comment,
          status: reviewStatus,
          publishedAt,
          moderatedAt,
          moderatedBy,
          moderationReason,
        },
      });

      // Review Moderation History (50+ entries)
      if (bIdx <= 60 || reviewStatus === 'HIDDEN' || reviewStatus === 'REJECTED') {
        const action: 'HIDDEN' | 'REJECTED' | 'PUBLISHED' = reviewStatus === 'HIDDEN' ? 'HIDDEN' : reviewStatus === 'REJECTED' ? 'REJECTED' : 'PUBLISHED';
        const reason: 'POLICY_VIOLATION' | 'SPAM' | 'OTHER' = reviewStatus === 'HIDDEN' ? 'POLICY_VIOLATION' : reviewStatus === 'REJECTED' ? 'SPAM' : 'OTHER';
        const moderatorId = staffUserMap[isOrg1 ? 'admin@example.com' : 'cbe.admin@example.com'].userId;
        await prisma.reviewModerationHistory.create({
          data: {
            organizationId: org.id,
            reviewId: review.id,
            moderatorUserId: moderatorId,
            actorUserId: moderatorId,
            fromStatus: reviewStatus === 'HIDDEN' ? 'PUBLISHED' : 'PENDING',
            toStatus: reviewStatus,
            action,
            reason,
            notes: moderationReason || 'Automated or manual compliance check passed',
          },
        });
      }

      // Provider Official Responses (20+ entries)
      if (bIdx <= 25) {
        await prisma.reviewResponse.upsert({
          where: { reviewId: review.id },
          update: {
            comment: `Thank you for your feedback! ${provider.name} takes immense pride in delivering top quality fabric care.`,
          },
          create: {
            reviewId: review.id,
            organizationId: org.id,
            providerId: provider.id,
            comment: `Thank you for your feedback! ${provider.name} takes immense pride in delivering top quality fabric care.`,
          },
        });
      }

      // Review Abuse Reports (30+ entries)
      if (bIdx >= 26 && bIdx <= 60) {
        const reportPublicId = `RPT-${org.publicId.slice(-4)}-${String(bIdx).padStart(4, '0')}`;
        const reporterUser = staffUserMap[isOrg1 ? 'ops@example.com' : 'cbe.ops@example.com'];
        const rptStatus = bIdx <= 40 ? 'RESOLVED' : bIdx <= 50 ? 'DISMISSED' : 'OPEN';
        const rptReason: 'INAPPROPRIATE_CONTENT' | 'SPAM' | 'HARASSMENT' = bIdx % 4 === 0 ? 'INAPPROPRIATE_CONTENT' : bIdx % 3 === 0 ? 'SPAM' : 'HARASSMENT';
        
        await prisma.reviewReport.upsert({
          where: { organizationId_publicId: { organizationId: org.id, publicId: reportPublicId } },
          update: {
            status: rptStatus,
            resolutionNote: rptStatus === 'RESOLVED' ? 'Action completed and verified by moderator.' : rptStatus === 'DISMISSED' ? 'Report reviewed and deemed non-violating.' : null,
            resolvedAt: rptStatus !== 'OPEN' ? new Date() : null,
            resolvedByUserId: rptStatus !== 'OPEN' ? staffUserMap[isOrg1 ? 'admin@example.com' : 'cbe.admin@example.com'].userId : null,
          },
          create: {
            publicId: reportPublicId,
            organizationId: org.id,
            reviewId: review.id,
            reportedByUserId: reporterUser.userId,
            reason: rptReason,
            description: 'Reported by operations monitoring for potential policy verification.',
            status: rptStatus,
            resolutionNote: rptStatus === 'RESOLVED' ? 'Action completed and verified by moderator.' : rptStatus === 'DISMISSED' ? 'Report reviewed and deemed non-violating.' : null,
            resolvedAt: rptStatus !== 'OPEN' ? new Date() : null,
            resolvedByUserId: rptStatus !== 'OPEN' ? staffUserMap[isOrg1 ? 'admin@example.com' : 'cbe.admin@example.com'].userId : null,
          },
        });
      }
    }

    // Audit Event
    await prisma.auditEvent.create({
      data: {
        organizationId: org.id,
        actorUserId: customer.userId,
        action: 'BOOKING_CREATED',
        entityType: 'Booking',
        entityId: booking.id,
        metadataJson: { bookingNumber, totalAmount: totalAmount.toNumber() },
      },
    });
  }

  // 9. SUPPORT TICKETS & DISPUTES
  console.log('🎫 Seeding Support Tickets & Disputes...');
  for (let tIdx = 1; tIdx <= 55; tIdx++) {
    const isOrg1 = tIdx <= 40;
    const org = isOrg1 ? org1 : org2;
    const customer = customerList.find(c => c.orgId === org.id)!;
    const supPublicId = `SUP-${org.publicId.slice(-4)}-${String(tIdx).padStart(4, '0')}`;

    const ticket = await prisma.supportTicket.upsert({
      where: { organizationId_publicId: { organizationId: org.id, publicId: supPublicId } },
      update: {},
      create: {
        publicId: supPublicId,
        organizationId: org.id,
        requesterType: 'CUSTOMER',
        customerId: customer.id,
        category: tIdx % 4 === 0 ? 'PAYMENT_ISSUE' : tIdx % 3 === 0 ? 'DELIVERY_DELAY' : 'BOOKING_ISSUE',
        priority: tIdx % 5 === 0 ? 'HIGH' : 'MEDIUM',
        status: tIdx % 3 === 0 ? 'RESOLVED' : 'OPEN',
        subject: `Inquiry regarding delivery schedule #${100 + tIdx}`,
        description: 'Need to update the preferred delivery time slot for the pickup order.',
      },
    });

    if (tIdx <= 25) {
      const dspPublicId = `DSP-${org.publicId.slice(-4)}-${String(tIdx).padStart(4, '0')}`;
      const firstBooking = await prisma.booking.findFirst({ where: { organizationId: org.id } });
      if (firstBooking) {
        await prisma.dispute.upsert({
          where: { organizationId_publicId: { organizationId: org.id, publicId: dspPublicId } },
          update: {},
          create: {
            publicId: dspPublicId,
            organizationId: org.id,
            bookingId: firstBooking.id,
            raisedByType: 'CUSTOMER',
            customerId: customer.id,
            type: tIdx % 2 === 0 ? 'QUALITY_DEFICIENCY' : 'INCORRECT_BILLING',
            priority: 'HIGH',
            status: tIdx % 2 === 0 ? 'UNDER_REVIEW' : 'RESOLVED',
            claimAmount: new Prisma.Decimal(150.00),
            reason: 'Missing item in return package',
            description: 'One linen pillow cover was not included in the delivered package.',
          },
        });
      }
    }
  }

  // 10. NOTIFICATIONS
  console.log('🔔 Seeding Operational Notifications...');
  for (let nIdx = 1; nIdx <= 60; nIdx++) {
    const isOrg1 = nIdx <= 45;
    const org = isOrg1 ? org1 : org2;
    const adminUser = staffUserMap[isOrg1 ? 'admin@example.com' : 'cbe.admin@example.com'];
    const notPublicId = `NOT-${org.publicId.slice(-4)}-${String(nIdx).padStart(4, '0')}`;

    await prisma.notification.upsert({
      where: { organizationId_publicId: { organizationId: org.id, publicId: notPublicId } },
      update: {},
      create: {
        publicId: notPublicId,
        organizationId: org.id,
        recipientUserId: adminUser.userId,
        type: nIdx % 4 === 0 ? 'PAYMENT' : nIdx % 3 === 0 ? 'ASSIGNMENT' : 'ORDER_STATUS',
        title: `Order Update #${1000 + nIdx}`,
        message: `Order #${1000 + nIdx} has been processed and ready for dispatch.`,
        priority: nIdx % 6 === 0 ? 'CRITICAL' : 'MEDIUM',
        status: nIdx % 2 === 0 ? 'READ' : 'UNREAD',
      },
    });
  }

  // 11. PROMOTIONS & COUPONS (B11)
  console.log('🏷️ Seeding Coupons & Promotional Offers (10+ Coupons, 10+ Offers)...');
  const now = new Date();
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const pastEndDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const couponDefs = [
    { org: org1, code: 'WASHORA10', name: '10% Off Regular Laundry', type: 'PERCENTAGE' as const, val: 10.0, min: 300.0, max: 200.0, limit: 500, used: 12, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, code: 'WASHORA20', name: '20% Off Weekend Special', type: 'PERCENTAGE' as const, val: 20.0, min: 500.0, max: 300.0, limit: 200, used: 8, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, code: 'FLAT50', name: 'Flat ₹50 Off Orders', type: 'FIXED_AMOUNT' as const, val: 50.0, min: 250.0, max: null, limit: 1000, used: 45, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, code: 'FLAT100', name: 'Flat ₹100 Off Dry Clean', type: 'FIXED_AMOUNT' as const, val: 100.0, min: 600.0, max: null, limit: 500, used: 15, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, code: 'VIP30', name: '30% Off VIP Member Special', type: 'PERCENTAGE' as const, val: 30.0, min: 1000.0, max: 500.0, limit: 100, used: 3, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, code: 'MONSOON15', name: 'Monsoon Saver 15%', type: 'PERCENTAGE' as const, val: 15.0, min: 400.0, max: 250.0, limit: 300, used: 0, status: 'INACTIVE' as const, from: now, until: nextYear },
    { org: org1, code: 'SUMMER25', name: 'Summer Splendor 25%', type: 'PERCENTAGE' as const, val: 25.0, min: 600.0, max: 350.0, limit: 100, used: 95, status: 'EXPIRED' as const, from: pastDate, until: pastEndDate },
    { org: org1, code: 'DIWALI50', name: 'Diwali Festive ₹150 Off', type: 'FIXED_AMOUNT' as const, val: 150.0, min: 800.0, max: null, limit: 500, used: 480, status: 'EXPIRED' as const, from: pastDate, until: pastEndDate },
    { org: org1, code: 'LIMITED1', name: 'Exclusive Single Redemption', type: 'FIXED_AMOUNT' as const, val: 100.0, min: 200.0, max: null, limit: 1, used: 1, status: 'DEPLETED' as const, from: now, until: nextYear },
    { org: org1, code: 'TESTCOUPON', name: 'General Test Coupon 10%', type: 'PERCENTAGE' as const, val: 10.0, min: 100.0, max: 100.0, limit: 1000, used: 2, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org2, code: 'CBEFIRST10', name: 'Coimbatore 10% Off', type: 'PERCENTAGE' as const, val: 10.0, min: 300.0, max: 150.0, limit: 300, used: 5, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org2, code: 'CBEFLAT75', name: 'Coimbatore Flat ₹75 Off', type: 'FIXED_AMOUNT' as const, val: 75.0, min: 400.0, max: null, limit: 200, used: 11, status: 'ACTIVE' as const, from: now, until: nextYear },
  ];

  for (let cIdx = 0; cIdx < couponDefs.length; cIdx++) {
    const c = couponDefs[cIdx];
    const cpnPublicId = `CPN-${c.org.publicId.slice(-4)}-${String(cIdx + 1).padStart(4, '0')}`;
    await prisma.coupon.upsert({
      where: { organizationId_code: { organizationId: c.org.id, code: c.code } },
      update: {},
      create: {
        publicId: cpnPublicId,
        organizationId: c.org.id,
        code: c.code,
        title: c.name,
        description: `Official promotional coupon for ${c.org.name}`,
        discountType: c.type,
        discountValue: new Prisma.Decimal(c.val),
        minOrderAmount: new Prisma.Decimal(c.min),
        maxDiscount: c.max ? new Prisma.Decimal(c.max) : null,
        usageLimit: c.limit,
        usedCount: c.used,
        validFrom: c.from,
        validUntil: c.until,
        status: c.status,
      },
    });
  }

  const offerDefs = [
    { org: org1, title: 'Welcome 20% Off', type: 'PERCENTAGE' as const, val: 20.0, min: 300.0, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, title: 'First Booking Flat ₹100', type: 'FIXED_AMOUNT' as const, val: 100.0, min: 400.0, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, title: 'Monsoon Care 15% Off', type: 'PERCENTAGE' as const, val: 15.0, min: 500.0, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, title: 'Steam Ironing Flat ₹50', type: 'FIXED_AMOUNT' as const, val: 50.0, min: 250.0, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, title: 'Dry Clean Special 25%', type: 'PERCENTAGE' as const, val: 25.0, min: 600.0, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, title: 'Weekend Wash Flat ₹60', type: 'FIXED_AMOUNT' as const, val: 60.0, min: 350.0, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, title: 'Loyalty Tier 30% Off', type: 'PERCENTAGE' as const, val: 30.0, min: 800.0, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org1, title: 'Summer Refresh 10%', type: 'PERCENTAGE' as const, val: 10.0, min: 300.0, status: 'INACTIVE' as const, from: now, until: nextYear },
    { org: org1, title: 'New Year Blast 35%', type: 'PERCENTAGE' as const, val: 35.0, min: 700.0, status: 'EXPIRED' as const, from: pastDate, until: pastEndDate },
    { org: org1, title: 'Winter Warmth ₹120', type: 'FIXED_AMOUNT' as const, val: 120.0, min: 600.0, status: 'EXPIRED' as const, from: pastDate, until: pastEndDate },
    { org: org2, title: 'Kovai Welcome 20% Off', type: 'PERCENTAGE' as const, val: 20.0, min: 300.0, status: 'ACTIVE' as const, from: now, until: nextYear },
    { org: org2, title: 'Kovai First Booking ₹100', type: 'FIXED_AMOUNT' as const, val: 100.0, min: 400.0, status: 'ACTIVE' as const, from: now, until: nextYear },
  ];

  for (let oIdx = 0; oIdx < offerDefs.length; oIdx++) {
    const o = offerDefs[oIdx];
    const offPublicId = `OFF-${o.org.publicId.slice(-4)}-${String(oIdx + 1).padStart(4, '0')}`;
    await prisma.promotionalOffer.upsert({
      where: { organizationId_publicId: { organizationId: o.org.id, publicId: offPublicId } },
      update: {},
      create: {
        publicId: offPublicId,
        organizationId: o.org.id,
        title: o.title,
        bannerText: `Exclusive offer: ${o.title}!`,
        discountType: o.type,
        discountValue: new Prisma.Decimal(o.val),
        minOrderAmount: new Prisma.Decimal(o.min),
        validFrom: o.from,
        validUntil: o.until,
        status: o.status,
      },
    });
  }

  // 12. SYNCHRONIZE PROVIDER & SERVICE RATING AGGREGATIONS (B12)
  console.log('⭐ Synchronizing Provider & Service Rating Aggregations from Seeded Published Reviews...');
  for (const prov of providerList) {
    const pubReviews = await prisma.review.findMany({
      where: { providerId: prov.id, status: 'PUBLISHED' },
      select: { rating: true },
    });
    const count = pubReviews.length;
    const avg = count > 0 ? pubReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;
    await prisma.provider.update({
      where: { id: prov.id },
      data: {
        totalReviews: count,
        rating: new Prisma.Decimal(avg.toFixed(2)),
      },
    });
  }

  for (const srv of allServices) {
    const pubReviews = await prisma.review.findMany({
      where: { serviceId: srv.id, status: 'PUBLISHED' },
      select: { rating: true },
    });
    const count = pubReviews.length;
    const avg = count > 0 ? pubReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;
    await prisma.service.update({
      where: { id: srv.id },
      data: {
        totalReviews: count,
        rating: new Prisma.Decimal(avg.toFixed(2)),
      },
    });
  }

  // 13. NOTIFICATIONS & COMMUNICATION DOMAIN (B13)
  console.log('📢 Seeding Notifications & Communication Domain (B13)...');

  const allUsers = await prisma.user.findMany({ select: { id: true, email: true } });
  const allOrganizations = [org1, org2];

  // 13.1 Notification Templates (20+ versioned templates across channels & organizations)
  const templateDefs = [
    {
      type: 'BOOKING_CONFIRMED',
      channel: 'IN_APP',
      titleTemplate: 'Booking Confirmed: {{bookingNumber}}',
      bodyTemplate: 'Hello {{customerName}}, your booking for {{serviceName}} is confirmed for {{pickupTime}}.',
      version: 1,
    },
    {
      type: 'BOOKING_CONFIRMED',
      channel: 'IN_APP',
      titleTemplate: 'Booking Confirmed: {{bookingNumber}}',
      bodyTemplate: 'Hi {{customerName}}! Great news! Your order {{bookingNumber}} for {{serviceName}} is confirmed. Valet pickup at {{pickupTime}}.',
      version: 2,
    },
    {
      type: 'BOOKING_CONFIRMED',
      channel: 'EMAIL',
      subject: 'Confirmation for Booking {{bookingNumber}} - WASHORA',
      titleTemplate: 'Booking Confirmed: {{bookingNumber}}',
      bodyTemplate: 'Dear {{customerName}},\n\nYour order {{bookingNumber}} for {{serviceName}} has been placed successfully. Pickup scheduled: {{pickupTime}}.\nTotal: {{currency}} {{amount}}.\n\nTrack your order: {{trackingUrl}}',
      version: 1,
    },
    {
      type: 'BOOKING_CONFIRMED',
      channel: 'SMS',
      titleTemplate: 'Booking {{bookingNumber}} Confirmed',
      bodyTemplate: 'WASHORA: Your booking {{bookingNumber}} is confirmed for {{pickupTime}}. Track: {{trackingUrl}}',
      version: 1,
    },
    {
      type: 'BOOKING_CONFIRMED',
      channel: 'PUSH',
      titleTemplate: 'Booking Confirmed! 🧺',
      bodyTemplate: 'Your pickup for {{serviceName}} is scheduled for {{pickupTime}}.',
      version: 1,
    },
    {
      type: 'PICKUP_SCHEDULED',
      channel: 'IN_APP',
      titleTemplate: 'Valet Scheduled: {{bookingNumber}}',
      bodyTemplate: 'Valet {{deliveryPartnerName}} has been assigned for pickup at {{pickupTime}}.',
      version: 1,
    },
    {
      type: 'PICKUP_SCHEDULED',
      channel: 'EMAIL',
      subject: 'Pickup Details for {{bookingNumber}}',
      titleTemplate: 'Valet Assigned: {{bookingNumber}}',
      bodyTemplate: 'Your valet {{deliveryPartnerName}} will arrive for pickup at {{pickupTime}}.',
      version: 1,
    },
    {
      type: 'PICKUP_COMPLETED',
      channel: 'IN_APP',
      titleTemplate: 'Garments Collected',
      bodyTemplate: 'Your clothes for booking {{bookingNumber}} have been picked up safely.',
      version: 1,
    },
    {
      type: 'PROCESSING_STARTED',
      channel: 'IN_APP',
      titleTemplate: 'Care Started: {{serviceName}}',
      bodyTemplate: 'Provider {{providerName}} has begun processing your garments for order {{bookingNumber}}.',
      version: 1,
    },
    {
      type: 'PROCESSING_COMPLETED',
      channel: 'IN_APP',
      titleTemplate: 'Order Ready for Delivery',
      bodyTemplate: 'Your garments for order {{bookingNumber}} are pristine and ready for return delivery.',
      version: 1,
    },
    {
      type: 'OUTFIT_DELIVERED',
      channel: 'IN_APP',
      titleTemplate: 'Order Delivered! 🎉',
      bodyTemplate: 'Your garments for booking {{bookingNumber}} have been delivered to {{address}}.',
      version: 1,
    },
    {
      type: 'OUTFIT_DELIVERED',
      channel: 'EMAIL',
      subject: 'Order Delivered - {{bookingNumber}}',
      titleTemplate: 'Delivered: {{bookingNumber}}',
      bodyTemplate: 'Hello {{customerName}}, your booking {{bookingNumber}} has been delivered. Thank you for choosing WASHORA!',
      version: 1,
    },
    {
      type: 'PAYMENT_SUCCESS',
      channel: 'IN_APP',
      titleTemplate: 'Payment Received: {{currency}} {{amount}}',
      bodyTemplate: 'Payment of {{currency}} {{amount}} for booking {{bookingNumber}} was successful.',
      version: 1,
    },
    {
      type: 'PAYMENT_SUCCESS',
      channel: 'EMAIL',
      subject: 'Payment Receipt - {{bookingNumber}}',
      titleTemplate: 'Receipt for {{bookingNumber}}',
      bodyTemplate: 'Dear {{customerName}}, payment of {{currency}} {{amount}} has been received. Thank you!',
      version: 1,
    },
    {
      type: 'REFUND_PROCESSED',
      channel: 'IN_APP',
      titleTemplate: 'Refund Processed: {{currency}} {{amount}}',
      bodyTemplate: 'A refund of {{currency}} {{amount}} for booking {{bookingNumber}} has been processed.',
      version: 1,
    },
    {
      type: 'REVIEW_REQUESTED',
      channel: 'IN_APP',
      titleTemplate: 'Rate your experience with {{providerName}}',
      bodyTemplate: 'How was your recent {{serviceName}} service? Tap to leave a rating and review.',
      version: 1,
    },
    {
      type: 'NEW_ORDER_ASSIGNED',
      channel: 'IN_APP',
      titleTemplate: 'New Order: {{bookingNumber}}',
      bodyTemplate: 'A new order for {{serviceName}} ({{amount}} {{currency}}) is assigned to your workshop.',
      version: 1,
    },
    {
      type: 'PAYOUT_SETTLED',
      channel: 'IN_APP',
      titleTemplate: 'Payout Settled: {{currency}} {{amount}}',
      bodyTemplate: 'Your net payout of {{currency}} {{amount}} has been settled to your account.',
      version: 1,
    },
    {
      type: 'DELIVERY_JOB_ASSIGNED',
      channel: 'IN_APP',
      titleTemplate: 'New Job Available: {{bookingNumber}}',
      bodyTemplate: 'Pickup requested at {{pickupTime}} for {{address}}. Tap to view details.',
      version: 1,
    },
    {
      type: 'OPERATIONS_BROADCAST',
      channel: 'IN_APP',
      titleTemplate: 'System Update',
      bodyTemplate: 'Important announcement from WASHORA Operations regarding service updates.',
      version: 1,
    },
    {
      type: 'SECURITY_ALERT',
      channel: 'IN_APP',
      titleTemplate: 'Security Alert: Account Activity',
      bodyTemplate: 'A new login was detected on your account on {{date}}.',
      version: 1,
    },
    {
      type: 'SECURITY_ALERT',
      channel: 'EMAIL',
      subject: 'Security Alert: Account Activity Detected',
      titleTemplate: 'Security Notification',
      bodyTemplate: 'Hello {{customerName}}, we detected new sign-in activity on {{date}}. If this was not you, please secure your account.',
      version: 1,
    },
  ];

  let tCount = 0;
  for (const org of allOrganizations) {
    for (const t of templateDefs) {
      tCount++;
      const pubId = `TMP-2026-${String(tCount).padStart(6, '0')}`;
      await prisma.notificationTemplate.upsert({
        where: {
          organizationId_type_channel_version: {
            organizationId: org.id,
            type: t.type,
            channel: t.channel as any,
            version: t.version,
          },
        },
        update: {},
        create: {
          publicId: pubId,
          organizationId: org.id,
          type: t.type,
          channel: t.channel as any,
          subject: (t as any).subject ?? null,
          titleTemplate: t.titleTemplate,
          bodyTemplate: t.bodyTemplate,
          version: t.version,
          status: 'ACTIVE',
        },
      });
    }
  }

  // 13.2 Seed NotificationPreferences for all users
  for (const u of allUsers) {
    const org = allOrganizations[u.email.includes('partner') ? 1 : 0];
    await prisma.notificationPreference.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        organizationId: org.id,
        inAppEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: true,
        pushEnabled: true,
        orderUpdates: true,
        marketingOffers: true,
        systemAlerts: true,
        categories: {
          BOOKING: true,
          ASSIGNMENT: true,
          PAYMENT: true,
          EARNINGS: true,
          PROMOTIONS: true,
          REVIEWS: true,
          SECURITY: true,
          SYSTEM: true,
        },
      },
    });
  }

  // 13.3 Seed 500+ Notifications across users & organizations
  const notifTypes = [
    'ORDER_STATUS',
    'ASSIGNMENT',
    'PAYMENT',
    'PAYOUT',
    'SUPPORT',
    'DISPUTE',
    'MARKETING',
    'SYSTEM',
  ];
  const notifPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const notifStatuses = ['UNREAD', 'READ', 'ARCHIVED'];

  const sampleNotifications = [
    { title: 'Booking Confirmed', message: 'Your booking has been confirmed and scheduled.', type: 'ORDER_STATUS' },
    { title: 'Valet on the Way', message: 'Valet partner is en route to collect your garments.', type: 'ASSIGNMENT' },
    { title: 'Payment Successful', message: 'Payment of ₹499.00 processed successfully.', type: 'PAYMENT' },
    { title: 'Garments Washed & Folded', message: 'Processing complete. Ready for dispatch.', type: 'ORDER_STATUS' },
    { title: 'Order Delivered', message: 'Your order was successfully delivered to your address.', type: 'ORDER_STATUS' },
    { title: 'Weekend Special: 20% Off', message: 'Use code WASH20 this weekend on premium dry cleaning.', type: 'MARKETING' },
    { title: 'Review Your Experience', message: 'Please take 30 seconds to rate your recent service.', type: 'SUPPORT' },
    { title: 'Earnings Credited', message: 'Weekly payout credited to your registered bank account.', type: 'PAYOUT' },
    { title: 'Scheduled Maintenance', message: 'Platform will undergo brief maintenance on Sunday 2 AM.', type: 'SYSTEM' },
    { title: 'Security Alert: Password Changed', message: 'Your account password was updated successfully.', type: 'SYSTEM' },
  ];

  const notifRecords: any[] = [];
  let notifSeq = 0;

  for (let i = 0; i < 520; i++) {
    notifSeq++;
    const targetUser = allUsers[i % allUsers.length];
    const org = allOrganizations[i % 2];
    const sample = sampleNotifications[i % sampleNotifications.length];
    const status = notifStatuses[i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2];
    const priority = notifPriorities[i % notifPriorities.length];
    const isRead = status === 'READ';

    notifRecords.push({
      publicId: `NOT-2026-${String(notifSeq).padStart(6, '0')}`,
      organizationId: org.id,
      recipientUserId: targetUser.id,
      type: sample.type as any,
      title: sample.title,
      message: sample.message,
      priority: priority as any,
      status: status as any,
      linkUrl: `/bookings/WAS-2026-${String((i % 50) + 1).padStart(6, '0')}`,
      data: { index: i, category: sample.type },
      readAt: isRead ? new Date(Date.now() - (i * 3600000)) : null,
      createdAt: new Date(Date.now() - (i * 7200000)),
    });
  }

  // Create notifications in chunks
  for (let c = 0; c < notifRecords.length; c += 100) {
    const chunk = notifRecords.slice(c, c + 100);
    await prisma.notification.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  // 13.4 Seed 200+ Communications and 500+ CommunicationRecipients
  const commChannels = ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH'];
  const commStatuses = ['QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED'];
  const recipientTypes = ['CUSTOMER', 'PROVIDER', 'DELIVERY_PARTNER', 'STAFF', 'ALL'];

  let commSeq = 0;
  for (let i = 0; i < 210; i++) {
    commSeq++;
    const org = allOrganizations[i % 2];
    const sender = allUsers[(i + 1) % allUsers.length];
    const channel = commChannels[i % commChannels.length];
    const status = commStatuses[i % commStatuses.length];
    const pubId = `COM-2026-${String(commSeq).padStart(6, '0')}`;

    const comm = await prisma.communication.create({
      data: {
        publicId: pubId,
        organizationId: org.id,
        senderUserId: sender.id,
        channel: channel as any,
        type: i % 4 === 0 ? 'BROADCAST' : 'TRANSACTIONAL',
        subject: `Communication Dispatch #${commSeq}`,
        body: `Communication body text for record #${commSeq} on channel ${channel}.`,
        content: `<p>Communication body text for record #${commSeq}</p>`,
        status: status as any,
        provider: `MOCK_${channel}_PROVIDER`,
        providerMessageId: `msg_${channel.toLowerCase()}_${Date.now()}_${i}`,
        attemptCount: status === 'FAILED' ? 2 : 1,
        lastAttemptAt: new Date(Date.now() - (i * 1800000)),
        failedAt: status === 'FAILED' ? new Date(Date.now() - (i * 1800000)) : null,
        failureReason: status === 'FAILED' ? 'Simulated delivery timeout' : null,
        sentAt: (status === 'SENT' || status === 'DELIVERED') ? new Date(Date.now() - (i * 3600000)) : null,
        createdAt: new Date(Date.now() - (i * 7200000)),
      },
    });

    // Create 2 to 3 recipients for each communication
    const recipCount = 2 + (i % 2);
    for (let r = 0; r < recipCount; r++) {
      const recipUser = allUsers[(i + r + 2) % allUsers.length];
      const recipType = recipientTypes[(i + r) % recipientTypes.length];
      await prisma.communicationRecipient.create({
        data: {
          communicationId: comm.id,
          organizationId: org.id,
          recipientType: recipType as any,
          recipientId: recipUser.id,
          userId: recipUser.id,
          channelAddress: recipUser.email,
          status: status as any,
          isRead: status === 'DELIVERED',
          readAt: status === 'DELIVERED' ? new Date() : null,
          deliveredAt: status === 'DELIVERED' ? new Date() : null,
          failedAt: status === 'FAILED' ? new Date() : null,
          failureReason: status === 'FAILED' ? 'Delivery timeout' : null,
        },
      });
    }
  }

  // 14. SUPPORT & DISPUTES DOMAIN (B14)
  console.log('🎧 Seeding Support & Disputes Domain (B14)...');

  const allBookings = await prisma.booking.findMany({
    select: {
      id: true,
      bookingNumber: true,
      organizationId: true,
      customerId: true,
      providerId: true,
      totalAmount: true,
      status: true,
      payment: { select: { id: true, status: true, amount: true } },
    },
  });

  const supportAgents = staffMembers.filter(
    (s) => s.role === 'SUPPORT_AGENT' || s.role === 'SUPPORT_LEAD',
  );

  // 14.1 Seed 160+ Support Tickets
  console.log('  -> Seeding 160 Support Tickets...');
  const ticketCategories = [
    'ORDER_STATUS',
    'PICKUP_DELIVERY',
    'PAYMENT_BILLING',
    'REFUND_DISPUTE',
    'QUALITY_DAMAGE',
    'ACCOUNT_APP',
    'SAFETY_TRUST',
    'OTHER',
  ];
  const ticketPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const ticketStatuses = [
    'OPEN',
    'IN_PROGRESS',
    'WAITING_FOR_CUSTOMER',
    'WAITING_FOR_INTERNAL',
    'ESCALATED',
    'RESOLVED',
    'CLOSED',
  ];

  const seededTickets: any[] = [];
  let tktSeq = 0;

  for (let i = 0; i < 165; i++) {
    tktSeq++;
    const org = allOrganizations[i % 2];
    const pubId = `SUP-2026-${String(tktSeq).padStart(6, '0')}`;
    const category = ticketCategories[i % ticketCategories.length];
    const priority = ticketPriorities[i % ticketPriorities.length];
    const status = ticketStatuses[i % ticketStatuses.length];

    // Determine requester role: 60% CUSTOMER, 25% PROVIDER, 15% DELIVERY_PARTNER
    let requesterType: 'CUSTOMER' | 'PROVIDER' | 'DELIVERY_PARTNER';
    let customerId: string | null = null;
    let providerId: string | null = null;
    let deliveryPartnerId: string | null = null;
    let createdByUserId: string;

    const orgCusts = customerList.filter((c) => c.orgId === org.id);
    const orgProvs = providerList.filter((p) => p.orgId === org.id);
    const orgValets = deliveryPartnerList.filter((v) => v.orgId === org.id);

    if (i % 10 < 6 && orgCusts.length > 0) {
      requesterType = 'CUSTOMER';
      const cust = orgCusts[i % orgCusts.length];
      customerId = cust.id;
      createdByUserId = cust.userId;
    } else if (i % 10 < 8.5 && orgProvs.length > 0) {
      requesterType = 'PROVIDER';
      const prov = orgProvs[i % orgProvs.length];
      providerId = prov.id;
      createdByUserId = prov.userId;
    } else if (orgValets.length > 0) {
      requesterType = 'DELIVERY_PARTNER';
      const valet = orgValets[i % orgValets.length];
      deliveryPartnerId = valet.id;
      createdByUserId = valet.userId;
    } else {
      requesterType = 'CUSTOMER';
      const cust = orgCusts[0];
      customerId = cust.id;
      createdByUserId = cust.userId;
    }

    // Link booking if applicable (~60% of tickets)
    const orgBookings = allBookings.filter((b) => b.organizationId === org.id);
    const booking = i % 3 !== 0 && orgBookings.length > 0 ? orgBookings[i % orgBookings.length] : null;
    const paymentId = booking?.payment?.id ?? null;

    // Assignment (~70% of tickets assigned to a support agent)
    const assignedAgent = (status !== 'OPEN' && supportAgents.length > 0)
      ? staffUserMap[supportAgents[i % supportAgents.length].email]?.userId
      : null;

    const isResolved = status === 'RESOLVED' || status === 'CLOSED';
    const isClosed = status === 'CLOSED';

    const ticket = await prisma.supportTicket.create({
      data: {
        publicId: pubId,
        organizationId: org.id,
        createdByUserId,
        requesterType,
        customerId,
        providerId,
        deliveryPartnerId,
        bookingId: booking?.id ?? null,
        paymentId,
        category: category as any,
        priority: priority as any,
        status: status as any,
        subject: `Support Inquiry #${tktSeq}: ${category.replace(/_/g, ' ').toLowerCase()}`,
        description: `Detailed support description for inquiry ${pubId}. Requester reported concern regarding service execution and timeline.`,
        assignedToUserId: assignedAgent,
        resolutionNote: isResolved ? 'Issue investigated thoroughly and resolved with customer alignment.' : null,
        resolvedAt: isResolved ? new Date(Date.now() - (165 - i) * 3600000) : null,
        closedAt: isClosed ? new Date(Date.now() - (165 - i) * 1800000) : null,
        createdAt: new Date(Date.now() - (165 - i) * 7200000),
      },
    });

    seededTickets.push(ticket);
  }

  // 14.2 Seed 320+ Support Messages (Public & Internal)
  console.log('  -> Seeding 330 Support Messages...');
  let msgSeq = 0;
  for (let i = 0; i < seededTickets.length; i++) {
    const tkt = seededTickets[i];
    msgSeq++;
    const pubId1 = `MSG-2026-${String(msgSeq).padStart(6, '0')}`;
    await prisma.supportMessage.create({
      data: {
        publicId: pubId1,
        organizationId: tkt.organizationId,
        ticketId: tkt.id,
        senderUserId: tkt.createdByUserId,
        message: `Hello, this is an update regarding my support request ${tkt.publicId}. Please check the status as soon as possible.`,
        isInternal: false,
        createdAt: new Date(tkt.createdAt.getTime() + 600000),
      },
    });

    msgSeq++;
    const pubId2 = `MSG-2026-${String(msgSeq).padStart(6, '0')}`;
    const agentUserId = tkt.assignedToUserId ?? staffUserMap['support.lead@example.com'].userId;
    const isInternal = i % 5 === 0;
    await prisma.supportMessage.create({
      data: {
        publicId: pubId2,
        organizationId: tkt.organizationId,
        ticketId: tkt.id,
        senderUserId: agentUserId,
        message: isInternal
          ? `[INTERNAL ONLY] Agent investigated logistics timeline for ticket ${tkt.publicId}. Dispatch confirmed pickup on schedule.`
          : `Hello, thank you for reaching out. We are actively reviewing your case ${tkt.publicId} and will update you shortly.`,
        isInternal,
        createdAt: new Date(tkt.createdAt.getTime() + 1800000),
      },
    });
  }

  // 14.3 Seed 110+ Support Notes (Internal only)
  console.log('  -> Seeding 110 Support Notes...');
  let noteSeq = 0;
  for (let i = 0; i < 115; i++) {
    noteSeq++;
    const tkt = seededTickets[i % seededTickets.length];
    const authorUser = staffUserMap[supportAgents[i % supportAgents.length].email];
    await prisma.supportNote.create({
      data: {
        publicId: `NOT-2026-${String(noteSeq).padStart(6, '0')}`,
        ticketId: tkt.id,
        organizationId: tkt.organizationId,
        authorUserId: authorUser.userId,
        message: `Internal note #${noteSeq}: Customer account and service history verified. Priority confirmed as ${tkt.priority}.`,
        isInternalOnly: true,
        createdAt: new Date(tkt.createdAt.getTime() + 2400000),
      },
    });
  }

  // 14.4 Seed 120+ Support Ticket Activities
  console.log('  -> Seeding 125 Support Ticket Activities...');
  const ticketActions = [
    'TICKET_CREATED',
    'MESSAGE_SENT',
    'ASSIGNED',
    'PRIORITY_UPDATED',
    'STATUS_UPDATED',
    'ESCALATED',
    'RESOLVED',
    'CLOSED',
  ];
  for (let i = 0; i < 125; i++) {
    const tkt = seededTickets[i % seededTickets.length];
    const action = ticketActions[i % ticketActions.length];
    const actorUser = tkt.assignedToUserId ?? tkt.createdByUserId;
    await prisma.supportTicketActivity.create({
      data: {
        ticketId: tkt.id,
        organizationId: tkt.organizationId,
        actorUserId: actorUser,
        action,
        previousValue: action === 'PRIORITY_UPDATED' ? 'LOW' : action === 'STATUS_UPDATED' ? 'OPEN' : null,
        newValue: action === 'PRIORITY_UPDATED' ? tkt.priority : action === 'STATUS_UPDATED' ? tkt.status : null,
        metadata: { seedIndex: i, actionType: action },
        createdAt: new Date(tkt.createdAt.getTime() + (i * 300000)),
      },
    });
  }

  // 14.5 Seed 80+ Disputes
  console.log('  -> Seeding 80 Disputes...');
  const disputeTypes = [
    'DAMAGED_ITEM',
    'MISSING_ITEM',
    'DELAYED_DELIVERY',
    'POOR_QUALITY',
    'WRONG_ORDER',
    'OVERCHARGED',
    'UNAUTHORIZED_CHARGE',
    'OTHER',
  ];
  const disputeStatuses = [
    'FILED',
    'UNDER_REVIEW',
    'AWAITING_CUSTOMER',
    'AWAITING_PROVIDER',
    'AWAITING_DELIVERY',
    'ESCALATED',
    'RESOLVED',
    'REJECTED',
    'CLOSED',
  ];

  const eligibleBookings = allBookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED',
  );

  const seededDisputes: any[] = [];
  let dspSeq = 0;

  for (let i = 0; i < 80; i++) {
    dspSeq++;
    const pubId = `DSP-2026-${String(dspSeq).padStart(6, '0')}`;
    const booking = eligibleBookings[i % eligibleBookings.length];
    const orgId = booking.organizationId;
    const type = disputeTypes[i % disputeTypes.length];
    const status = disputeStatuses[i % disputeStatuses.length];
    const priority = ticketPriorities[i % ticketPriorities.length];

    const customer = customerList.find((c) => c.id === booking.customerId);
    const provider = providerList.find((p) => p.id === booking.providerId);
    const createdByUserId = customer?.userId ?? staffUserMap['admin@example.com'].userId;

    const isResolved = status === 'RESOLVED';
    const isRejected = status === 'REJECTED';
    const isClosed = status === 'CLOSED';

    const claimAmount = booking.totalAmount;
    const resolvedAmount = isResolved ? booking.totalAmount.mul(i % 2 === 0 ? 1.0 : 0.5) : null;
    const outcome = isResolved ? (i % 2 === 0 ? 'CUSTOMER_FAVORED' : 'SPLIT') : isRejected ? 'REJECTED' : null;
    const resolutionType = isResolved ? (i % 2 === 0 ? 'FULL_REFUND' : 'PARTIAL_REFUND') : null;

    const assignedToUserId = status !== 'FILED'
      ? staffUserMap[supportAgents[i % supportAgents.length].email]?.userId
      : null;

    const dispute = await prisma.dispute.create({
      data: {
        publicId: pubId,
        organizationId: orgId,
        bookingId: booking.id,
        paymentId: booking.payment?.id ?? null,
        createdByUserId,
        raisedByType: 'CUSTOMER',
        customerId: booking.customerId,
        providerId: booking.providerId,
        type: type as any,
        priority: priority as any,
        status: status as any,
        claimAmount,
        resolvedAmount,
        currency: 'INR',
        outcome: outcome as any,
        resolutionType,
        resolutionNote: isResolved ? 'Resolved through operational mediation with refund.' : null,
        reason: `Formal dispute: ${type.replace(/_/g, ' ').toLowerCase()}`,
        description: `Customer submitted formal dispute ${pubId} for booking ${booking.bookingNumber}. Detailed investigation opened.`,
        assignedToUserId,
        decisionReason: isResolved ? 'Evidence validates customer claim.' : isRejected ? 'Evidence does not corroborate claim.' : null,
        resolvedAt: isResolved ? new Date(Date.now() - (80 - i) * 3600000) : null,
        closedAt: isClosed ? new Date(Date.now() - (80 - i) * 1800000) : null,
        createdAt: new Date(Date.now() - (80 - i) * 7200000),
      },
    });

    seededDisputes.push(dispute);
  }

  // 14.6 Seed 160+ Dispute Activities
  console.log('  -> Seeding 160 Dispute Activities...');
  const disputeActions = [
    'DISPUTE_FILED',
    'REVIEW_STARTED',
    'CUSTOMER_RESPONSE_REQUESTED',
    'PROVIDER_RESPONSE_REQUESTED',
    'EVIDENCE_SUBMITTED',
    'EVIDENCE_ACCEPTED',
    'EVIDENCE_REJECTED',
    'ESCALATED',
    'RESOLVED',
    'REJECTED',
  ];
  for (let i = 0; i < 165; i++) {
    const dsp = seededDisputes[i % seededDisputes.length];
    const action = disputeActions[i % disputeActions.length];
    const actorUserId = dsp.assignedToUserId ?? dsp.createdByUserId;

    await prisma.disputeActivity.create({
      data: {
        disputeId: dsp.id,
        organizationId: dsp.organizationId,
        actorUserId,
        action,
        previousValue: action === 'ESCALATED' ? 'HIGH' : null,
        newValue: action === 'ESCALATED' ? 'URGENT' : null,
        details: `Dispute activity log for action ${action}`,
        metadata: { seedIndex: i, action },
        createdAt: new Date(dsp.createdAt.getTime() + (i * 180000)),
      },
    });
  }

  // 14.7 Seed 110+ Dispute Evidence Records
  console.log('  -> Seeding 110 Dispute Evidence Records...');
  const evidenceTypes = ['PHOTO', 'VIDEO', 'DOCUMENT', 'RECEIPT', 'COMMUNICATION_LOG'];
  const evidenceStatuses = ['SUBMITTED', 'ACCEPTED', 'REJECTED'];
  let evdSeq = 0;

  for (let i = 0; i < 115; i++) {
    evdSeq++;
    const dsp = seededDisputes[i % seededDisputes.length];
    const fileType = evidenceTypes[i % evidenceTypes.length];
    const status = evidenceStatuses[i % evidenceStatuses.length];
    const pubId = `EVD-2026-${String(evdSeq).padStart(6, '0')}`;

    await prisma.disputeEvidence.create({
      data: {
        publicId: pubId,
        disputeId: dsp.id,
        organizationId: dsp.organizationId,
        submittedByUserId: dsp.createdByUserId,
        title: `Supporting Evidence #${evdSeq} (${fileType})`,
        description: `Verified evidence attachment regarding dispute claim for ${dsp.publicId}`,
        fileUrl: `https://storage.washora.test/disputes/${dsp.publicId}/evidence/${pubId}.jpg`,
        fileType,
        storageKey: `disputes/${dsp.publicId}/evidence/${pubId}.jpg`,
        mimeType: fileType === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
        fileName: `evidence_${evdSeq}.jpg`,
        fileSize: 1024 * 1024 * (1 + (i % 5)),
        uploadedByType: 'CUSTOMER',
        status,
        rejectionReason: status === 'REJECTED' ? 'Image quality insufficient for fabric damage assessment' : null,
        createdAt: new Date(dsp.createdAt.getTime() + 300000),
      },
    });
  }

  // 14.8 Seed 160+ Dispute Messages
  console.log('  -> Seeding 160 Dispute Messages...');
  let dmsgSeq = 0;
  for (let i = 0; i < seededDisputes.length; i++) {
    const dsp = seededDisputes[i];
    dmsgSeq++;
    const pubId1 = `DMSG-2026-${String(dmsgSeq).padStart(6, '0')}`;
    await prisma.disputeMessage.create({
      data: {
        publicId: pubId1,
        organizationId: dsp.organizationId,
        disputeId: dsp.id,
        senderUserId: dsp.createdByUserId,
        message: `Statement submitted for dispute ${dsp.publicId}: Garments were not handled according to care label instructions.`,
        isInternal: false,
        createdAt: new Date(dsp.createdAt.getTime() + 600000),
      },
    });

    dmsgSeq++;
    const pubId2 = `DMSG-2026-${String(dmsgSeq).padStart(6, '0')}`;
    const agentUserId = dsp.assignedToUserId ?? staffUserMap['support.lead@example.com'].userId;
    const isInternal = i % 4 === 0;
    await prisma.disputeMessage.create({
      data: {
        publicId: pubId2,
        organizationId: dsp.organizationId,
        disputeId: dsp.id,
        senderUserId: agentUserId,
        message: isInternal
          ? `[INTERNAL REVIEW] Provider workshop photos analyzed. Stain pre-treatment was logged at inspection.`
          : `Dispute investigation in progress. All parties are invited to provide additional documentation.`,
        isInternal,
        createdAt: new Date(dsp.createdAt.getTime() + 1200000),
      },
    });
  }

  console.log('✅ Deterministic Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
