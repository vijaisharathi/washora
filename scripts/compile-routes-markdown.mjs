import fs from 'fs';

const routes = JSON.parse(fs.readFileSync('temp_routes.json', 'utf-8'));

function categorizeRoute(route) {
  const url = route.routeUrl;
  if (url.startsWith('/customer')) return 'Customer';
  if (url.startsWith('/provider')) return 'Provider';
  if (url.startsWith('/delivery-partner')) return 'Delivery Partner';
  if (url.startsWith('/admin')) return 'Admin & Operations';
  return 'General / Root';
}

function explainRoute(url, portal) {
  // Customer Explanations
  if (portal === 'Customer') {
    if (url === '/customer') return {
      name: 'Customer Home & Discovery Feed',
      desc: 'District-inspired location-first consumer discovery feed with horizontal category rails, prominent search, active orders, and studio highlights.',
      auth: 'Public / Optional Auth'
    };
    if (url === '/customer/services') return {
      name: 'Specialty Services Catalog',
      desc: 'Catalog of all garment, shoe, car, and leather cleaning treatments with category filter pills and search.',
      auth: 'Public'
    };
    if (url === '/customer/services/[slug]') return {
      name: 'Department / Category Overview',
      desc: 'Specific department page (e.g., Clothing Care, Shoe Care) with specialty treatment list and pricing.',
      auth: 'Public'
    };
    if (url === '/customer/services/[slug]/[itemId]') return {
      name: 'Service Treatment Detail',
      desc: 'Deep-dive product page with photo gallery, variant selector, inclusions/exclusions, provider preview, and booking CTA.',
      auth: 'Public'
    };
    if (url === '/customer/providers') return {
      name: 'Care Studios Directory & Map',
      desc: 'Interactive split-view map and list of certified workshop partner studios, ratings, distance, and specialties.',
      auth: 'Public'
    };
    if (url === '/customer/providers/[id]') return {
      name: 'Partner Studio Profile',
      desc: 'Studio credentials, certifications, equipment gallery, offered treatments, operating hours, and customer reviews.',
      auth: 'Public'
    };
    if (url === '/customer/booking') return {
      name: '4-Step Interactive Booking Stepper',
      desc: 'Service configuration, address selection, pickup/delivery scheduling (date chips & time slots), and order review.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/checkout') return {
      name: 'Checkout & Bill Summary',
      desc: 'Review of service items, pickup slot, delivery address, discount coupon application, and pricing breakdown.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/payment') return {
      name: 'Payment Processing Gateway',
      desc: 'Secure payment screen supporting UPI, Credit/Debit Cards, Netbanking, and Cash-on-Delivery with double-entry ledger integration.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/order-confirmation') return {
      name: 'Order Confirmation & Receipt',
      desc: 'Post-payment success screen with booking reference ID, summary card, and live tracking launch action.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/orders') return {
      name: 'My Care Bookings (Active & Past)',
      desc: 'Order history list with status tabs (Active vs Past), rebook actions, and direct links to live tracking.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/orders/[id]') return {
      name: '8-Stage Live Order Tracking',
      desc: 'Real-time 8-stage progress tracker from valet pickup en route to workshop inspection, cleaning, QC, and delivery.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/orders/[id]/receipt') return {
      name: 'Tax Invoice & Payment Receipt',
      desc: 'Itemized invoice download and view with GST breakdown and transaction proofs.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/orders/[id]/reschedule') return {
      name: 'Reschedule Pickup / Delivery Slot',
      desc: 'Customer self-service calendar slot modification before driver is dispatched.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/orders/[id]/cancel') return {
      name: 'Order Cancellation & Refund Estimate',
      desc: 'Safe pre-pickup booking cancellation with dynamic refund breakdown calculation.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/orders/[id]/dispute') return {
      name: 'File Service Dispute / Grievance',
      desc: 'Dispute filing workflow for damaged items or missed items with photo uploads.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/orders/[id]/review') return {
      name: 'Post-Service Rating & Review',
      desc: '1-5 star review submission with photo attachments and feedback for the studio and driver.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/offers') return {
      name: 'Promotions & Loyalty Rewards Hub',
      desc: 'Exclusive promo banners, cashback coupons, and loyalty points redemption catalog.',
      auth: 'Public / Authenticated'
    };
    if (url === '/customer/coupons') return {
      name: 'Available Coupons & Vouchers',
      desc: 'List of applicable promo codes, discount percentages, and minimum order requirements.',
      auth: 'Public / Authenticated'
    };
    if (url === '/customer/profile') return {
      name: 'Customer Profile & Account Hub',
      desc: 'Overview of customer details, loyalty tier status, quick settings links, and logout trigger.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/profile/edit') return {
      name: 'Edit Personal Details',
      desc: 'Update customer full name, contact phone number, and avatar image.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/profile/security') return {
      name: 'Account Security & Password',
      desc: 'Change account password, view active login sessions, and configure two-factor authentication.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/account') return {
      name: 'Account Redirector',
      desc: 'Convenience redirect route forwarding to /customer/profile.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/addresses') return {
      name: 'Saved Delivery Addresses',
      desc: 'List of saved Home, Work, and Other addresses with default address switcher and deletion.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/addresses/new') return {
      name: 'Add New Delivery Address',
      desc: 'Interactive map picker and address form with pincode and landmark fields.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/addresses/[id]/edit') return {
      name: 'Edit Saved Address',
      desc: 'Update existing address details, apartment number, and delivery instructions.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/location') return {
      name: 'Global Location & Area Selector',
      desc: 'GPS location auto-detection, postal code lookup, and manual area selection for hyper-local pricing.',
      auth: 'Public'
    };
    if (url === '/customer/notifications') return {
      name: 'Customer Notifications Center',
      desc: 'Real-time alerts for booking status changes, driver dispatch, invoices, and promo alerts.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/notifications/preferences') return {
      name: 'Notification Channels & Preferences',
      desc: 'Manage push notifications, SMS alerts, WhatsApp updates, and promotional emails.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/support') return {
      name: 'Customer Help Center & FAQs',
      desc: 'Self-help knowledgebase, searchable FAQs, and direct links to live agent support.',
      auth: 'Public'
    };
    if (url === '/customer/support/report-issue') return {
      name: 'Submit Help Request / Ticket',
      desc: 'Formal customer support ticket creation with category tagging and order association.',
      auth: 'Authenticated (CUSTOMER)'
    };
    if (url === '/customer/auth') return {
      name: 'Customer Auth Index',
      desc: 'Landing screen routing to login or account registration.',
      auth: 'Public'
    };
    if (url === '/customer/auth/login') return {
      name: 'Customer Login',
      desc: 'Sign in with email/phone and password or OTP.',
      auth: 'Public (Guest)'
    };
    if (url === '/customer/auth/register') return {
      name: 'Customer Sign Up',
      desc: 'New customer registration with phone verification.',
      auth: 'Public (Guest)'
    };
    if (url === '/customer/auth/forgot-password') return {
      name: 'Password Recovery Request',
      desc: 'Request password reset link/code to registered email or mobile number.',
      auth: 'Public (Guest)'
    };
    if (url === '/customer/auth/reset-password') return {
      name: 'Set New Password',
      desc: 'Token-based password reset screen with password strength validation.',
      auth: 'Public (Guest)'
    };
    if (url === '/customer/auth/verify-phone') return {
      name: 'OTP Phone Verification',
      desc: '6-digit SMS OTP verification screen for mobile number validation.',
      auth: 'Public (Guest)'
    };
    if (url === '/customer/auth/success') return {
      name: 'Auth Verification Complete',
      desc: 'Successful authentication splash screen auto-redirecting to /customer.',
      auth: 'Authenticated (CUSTOMER)'
    };
  }

  // Provider Explanations
  if (portal === 'Provider') {
    if (url === '/provider' || url === '/provider/dashboard') return {
      name: 'Provider Studio Operations Dashboard',
      desc: 'KPI metrics overview: active garments in workshop, capacity utilization, pending intakes, and daily revenue.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/orders') return {
      name: 'Workshop Orders & Pipeline',
      desc: 'Kanban & list of cleaning orders across inspection, washing, pressing, and quality-check stages.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/orders/[orderId]') return {
      name: 'Order Workshop Processing & QA',
      desc: 'Detailed item-level intake inspection, fabric defect tagging, treatment log, and stage transitions.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/bookings') return {
      name: 'Upcoming Bookings & Capacity',
      desc: 'Scheduled garment arrivals, load forecasting, and intake scheduling.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/bookings/[bookingId]') return {
      name: 'Booking Intake Details',
      desc: 'Pre-inspection booking manifest with customer special instructions.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/pickup' || url === '/provider/pickups') return {
      name: 'Driver Inbound Pickups Management',
      desc: 'Coordination of valet delivery arrivals carrying dirty laundry to the workshop.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url.includes('/provider/pickup/') || url.includes('/provider/pickups/')) return {
      name: 'Inbound Bag Manifest & Verification',
      desc: 'Barcode scanning and bag intake verification from delivery driver.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/handover') return {
      name: 'Ready for Delivery Outbound Handoff',
      desc: 'Finished, packaged garments waiting for valet drivers to pick up and deliver.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url.includes('/provider/handover/')) return {
      name: 'Outbound Driver Handoff Verification',
      desc: 'OTP & barcode confirmation when handing over completed garments to delivery valet.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/services') return {
      name: 'Studio Treatment Catalog & Pricing',
      desc: 'Manage offered services, custom rates, turnaround promises, and active/inactive status.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/services/new') return {
      name: 'Create New Treatment Listing',
      desc: 'Add custom laundry, dry cleaning, or restoration service with tiered pricing.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/services/[serviceId]') return {
      name: 'Treatment Configuration Details',
      desc: 'View service details, variant pricing, and performance statistics.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/services/[serviceId]/edit') return {
      name: 'Edit Treatment Parameters',
      desc: 'Modify pricing, turnaround hours, and service availability.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/availability' || url === '/provider/schedule') return {
      name: 'Workshop Hours & Daily Capacity',
      desc: 'Configure operating days, weekly working shifts, maximum garment capacity, and holiday blackout dates.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/earnings') return {
      name: 'Studio Revenue & Financial Statement',
      desc: 'Gross billings, platform commission deductions, net receivables, and settlement statements.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/payouts') return {
      name: 'Bank Payouts & Settlement History',
      desc: 'Automated bank account disbursements, payout status, and transaction reference numbers.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/reviews') return {
      name: 'Customer Ratings & Feedback',
      desc: 'Customer satisfaction scores, reviews, and provider public response manager.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url.includes('/provider/reviews/')) return {
      name: 'Individual Review & Dispute Reply',
      desc: 'Examine detailed customer review and submit official studio response.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/onboarding' || url === '/provider/onboarding/status') return {
      name: 'Provider Studio Verification & KYC',
      desc: 'Business license upload, GSTIN verification, workshop equipment audit, and approval status.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/profile' || url === '/provider/account') return {
      name: 'Studio Business Profile & Facility',
      desc: 'Studio name, branding images, facility address, contact numbers, and equipment details.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/settings') return {
      name: 'Studio Operational Settings',
      desc: 'Auto-accept rules, lead-time buffers, and staff notification toggles.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url === '/provider/notifications' || url === '/provider/notifications/preferences') return {
      name: 'Provider Alerts & Notification Preferences',
      desc: 'Urgent order alerts, capacity warnings, payout notifications, and dispatch updates.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url.startsWith('/provider/support')) return {
      name: 'Provider Partner Support & Desk',
      desc: 'Technical, financial, and operational help requests with WASHORA Partner Operations.',
      auth: 'Authenticated (PROVIDER)'
    };
    if (url.startsWith('/provider/auth')) return {
      name: 'Provider Authentication & Access',
      desc: 'Partner portal login, workshop staff registration, and password recovery.',
      auth: 'Public / Guest'
    };
  }

  // Delivery Partner Explanations
  if (portal === 'Delivery Partner') {
    if (url === '/delivery-partner' || url === '/delivery-partner/dashboard') return {
      name: 'Delivery Valet Dashboard & Live Run',
      desc: 'Active job queue, shift status (Online/Offline toggle), daily earnings, and completion stats.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/tasks') return {
      name: 'Available & Assigned Logistics Jobs',
      desc: 'List of customer doorstep pickups and workshop delivery drop-offs.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/tasks/[taskId]') return {
      name: 'Task Dispatch & Order Overview',
      desc: 'Job details, customer contact, item count estimate, and accept/reject action.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/pickup' || url === '/delivery-partner/pickup/[taskId]') return {
      name: 'Customer Doorstep Pickup Flow',
      desc: 'Navigation to customer address, bag barcode scan, intake verification, and customer OTP sign-off.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/delivery' || url === '/delivery-partner/delivery/[taskId]') return {
      name: 'Completed Order Delivery Handoff',
      desc: 'Turn-by-turn navigation to doorstep, proof-of-delivery photo capture, and handover confirmation.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/deliveries' || url.includes('/delivery-partner/deliveries/')) return {
      name: 'Active Delivery Route & Batch Tasks',
      desc: 'Optimized multi-stop delivery route view with estimated arrival times.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/route') return {
      name: 'Live GPS Multi-Stop Navigation Map',
      desc: 'Map overview plotting optimal transit between customer homes and partner workshops.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/history' || url.includes('/delivery-partner/history/')) return {
      name: 'Valet Trip History & Proofs',
      desc: 'Historical list of all completed pickups and drop-offs with digital signature proofs.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/earnings' || url.includes('/delivery-partner/earnings/')) return {
      name: 'Daily & Weekly Valet Earnings',
      desc: 'Base pay, distance allowance, tip ledger, peak incentives, and weekly payout summaries.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/payouts' || url.includes('/delivery-partner/payouts/')) return {
      name: 'Driver Bank Payout Receipts',
      desc: 'Direct UPI/Bank account deposit records and settlement statements.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/reviews' || url.includes('/delivery-partner/reviews/')) return {
      name: 'Driver Service Ratings & Badges',
      desc: 'Customer ratings for punctuality, handling care, and etiquette with performance tier badges.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/schedule') return {
      name: 'Delivery Shift & Slot Planner',
      desc: 'Book working time slots and select preferred operating service zones.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/onboarding' || url === '/delivery-partner/onboarding/status') return {
      name: 'Driver Onboarding & License KYC',
      desc: 'Driver license upload, vehicle RC, criminal background verification, and training modules.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/profile' || url === '/delivery-partner/account') return {
      name: 'Driver Profile & Emergency Contacts',
      desc: 'Personal information, registered vehicle details, and emergency SOS contacts.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url === '/delivery-partner/settings') return {
      name: 'Valet App Preferences',
      desc: 'Navigation app choice (Google Maps vs Waze), audio alert tones, and battery saver settings.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url.startsWith('/delivery-partner/notifications')) return {
      name: 'Dispatch & Surge Alerts',
      desc: 'Instant notifications for new nearby job requests, route reroutes, and urgent cancellations.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url.startsWith('/delivery-partner/support')) return {
      name: 'Driver Roadside & Order Assistance',
      desc: 'Live dispatch hotline, customer unreachable reporting, and vehicle breakdown assistance.',
      auth: 'Authenticated (DELIVERY_PARTNER)'
    };
    if (url.startsWith('/delivery-partner/auth')) return {
      name: 'Driver Authentication & Onboarding',
      desc: 'Secure driver login, registration, phone verification, and credential recovery.',
      auth: 'Public / Guest'
    };
  }

  // Admin Explanations
  if (portal === 'Admin & Operations') {
    if (url === '/admin') return {
      name: 'Master Control & Operations Command Center',
      desc: 'Platform-wide live cockpit: active orders, system health, revenue ticker, SLA breaches, and fleet alerts.',
      auth: 'Authenticated (ADMIN / OPERATIONS)'
    };
    if (url === '/admin/operations') return {
      name: 'Live Order Dispatch & Fleet Management',
      desc: 'Real-time citywide operations grid tracking all active pickups, cleaning jobs, and deliveries.',
      auth: 'Authenticated (ADMIN / OPERATIONS)'
    };
    if (url.includes('/admin/operations/')) return {
      name: 'Admin Order Intervention & Override',
      desc: 'Force status transition, reassign delivery partner, or reroute order to another workshop.',
      auth: 'Authenticated (ADMIN / OPERATIONS)'
    };
    if (url === '/admin/customers') return {
      name: 'Customer Database & Accounts',
      desc: 'Directory of registered customers, lifetime spend, order history, and account suspension tools.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url.includes('/admin/customers/')) return {
      name: 'Customer 360 Profile & Audit Trail',
      desc: 'Comprehensive customer dossier with full order history, saved addresses, reward balance, and GDPR controls.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url === '/admin/providers') return {
      name: 'Provider Studio Partners Management',
      desc: 'Management of certified workshop partners, capacity compliance, and quality rating audits.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url.includes('/admin/providers/')) return {
      name: 'Provider Partner Dossier & Audit',
      desc: 'Workshop contract details, equipment inspections, fee split rules, and performance metrics.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url === '/admin/delivery-partners') return {
      name: 'Valet Fleet Roster & Monitoring',
      desc: 'Active driver roster, vehicle verification status, real-time GPS coordinates, and completion rates.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url.includes('/admin/delivery-partners/')) return {
      name: 'Delivery Partner Audit & Performance',
      desc: 'Driver background checks, license documentation, earnings record, and customer feedback ledger.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url === '/admin/services') return {
      name: 'Master Services Catalog Manager',
      desc: 'Configure universal categories (Clothing, Shoe, Car, Bag, Helmet), base prices, and master SLAs.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url === '/admin/services/new') return {
      name: 'Create Global Service Treatment',
      desc: 'Define new platform-wide laundry or restoration treatment with default pricing rules.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url.includes('/admin/services/') && url.includes('/edit')) return {
      name: 'Edit Global Service Parameters',
      desc: 'Modify description, image assets, default addons, and standard turnaround hours.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url.includes('/admin/services/')) return {
      name: 'Global Service Analytics & Details',
      desc: 'Performance metrics for a specific service category across all cities and partner workshops.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url === '/admin/payments') return {
      name: 'Financial Ledger & Transaction Reconciliation',
      desc: 'Double-entry balance verification, gateway fee reconciliation, and platform margin analytics.',
      auth: 'Authenticated (ADMIN / FINANCIAL)'
    };
    if (url.includes('/admin/payments/transactions/')) return {
      name: 'Transaction Forensic Audit Record',
      desc: 'Raw payment gateway payload, cryptographic signatures, bank response codes, and ledger journal entry.',
      auth: 'Authenticated (ADMIN / FINANCIAL)'
    };
    if (url.includes('/admin/payments/providers/')) return {
      name: 'Provider Settlement Run & Disbursal',
      desc: 'Audit and approve automated payouts to workshop studio bank accounts.',
      auth: 'Authenticated (ADMIN / FINANCIAL)'
    };
    if (url.includes('/admin/payments/delivery-partners/')) return {
      name: 'Driver Payout Ledger & Approval',
      desc: 'Review driver trip fares, bonuses, tips, and batch disbursals.',
      auth: 'Authenticated (ADMIN / FINANCIAL)'
    };
    if (url.includes('/admin/payments/bookings/')) return {
      name: 'Booking Payment & Refund Ledger',
      desc: 'Detailed breakdown of payment, taxes, service fee, and refund audit history for an individual booking.',
      auth: 'Authenticated (ADMIN / FINANCIAL)'
    };
    if (url === '/admin/disputes') return {
      name: 'Customer Grievances & Claim Resolution',
      desc: 'Triage queue for damaged items, lost garments, or late delivery claims with insurance tracking.',
      auth: 'Authenticated (ADMIN / SUPPORT)'
    };
    if (url.includes('/admin/disputes/')) return {
      name: 'Dispute Investigation & Resolution Case',
      desc: 'Examine intake photos, compare with delivery proof, adjudicate liability, and issue customer refunds.',
      auth: 'Authenticated (ADMIN / SUPPORT)'
    };
    if (url === '/admin/support') return {
      name: 'Omnichannel Customer & Partner Helpdesk',
      desc: 'Unified ticketing queue handling queries from customers, providers, and drivers.',
      auth: 'Authenticated (ADMIN / SUPPORT)'
    };
    if (url === '/admin/support/new') return {
      name: 'Create Internal Operations Ticket',
      desc: 'Log manual complaint or escalations on behalf of customer or partner.',
      auth: 'Authenticated (ADMIN / SUPPORT)'
    };
    if (url.includes('/admin/support/')) return {
      name: 'Support Ticket Thread & Resolution',
      desc: 'Direct customer communication, internal agent notes, and ticket resolution actions.',
      auth: 'Authenticated (ADMIN / SUPPORT)'
    };
    if (url === '/admin/communications' || url.includes('/admin/communications')) return {
      name: 'Broadcast Announcements & SMS/Email Campaigns',
      desc: 'Send citywide service alerts, promotional push notifications, and partner maintenance announcements.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url.startsWith('/admin/reports')) return {
      name: 'BI & Analytical Reporting Engine',
      desc: 'Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.',
      auth: 'Authenticated (ADMIN / ANALYTICS)'
    };
    if (url === '/admin/reviews' || url.includes('/admin/reviews/')) return {
      name: 'Platform Reviews Moderation & Quality Control',
      desc: 'Audit customer reviews, flag inappropriate content, and monitor partner quality scores.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url === '/admin/onboarding') return {
      name: 'Partner KYC & Document Verification Queue',
      desc: 'Compliance review queue for pending studio and driver applications.',
      auth: 'Authenticated (ADMIN)'
    };
    if (url === '/admin/organization') return {
      name: 'Multi-Tenant Organization Management',
      desc: 'Cross-tenant organization configuration, regional franchise boundaries, and tenant isolation controls.',
      auth: 'Authenticated (SUPER_ADMIN)'
    };
    if (url.startsWith('/admin/settings')) return {
      name: 'Platform Governance & RBAC Security Settings',
      desc: 'Manage admin roles, API keys, webhook integrations, audit logs, and security policies.',
      auth: 'Authenticated (SUPER_ADMIN)'
    };
    if (url === '/admin/login') return {
      name: 'Admin & Operator Secure Sign-In',
      desc: 'MFA-enforced admin authentication gateway with hardware token and audit logging.',
      auth: 'Public (Restricted Access)'
    };
    if (url === '/admin/unauthorized') return {
      name: 'Access Denied & RBAC Violation Notice',
      desc: 'Security splash displayed when user attempts to access routes beyond their role permissions.',
      auth: 'Authenticated'
    };
  }

  if (url === '/') return {
    name: 'Platform Root Gateway',
    desc: 'Main landing page or gateway redirecting consumers to /customer discovery experience.',
    auth: 'Public'
  };

  return {
    name: url.split('/').pop().replace(/\[|\]/g, ''),
    desc: 'Application route supporting domain workflows.',
    auth: 'Role-Based'
  };
}

const categorized = {
  Customer: [],
  Provider: [],
  'Delivery Partner': [],
  'Admin & Operations': [],
  'General / Root': []
};

for (const r of routes) {
  const portal = categorizeRoute(r);
  const info = explainRoute(r.routeUrl, portal);
  categorized[portal].push({
    ...r,
    ...info
  });
}

let md = `# WASHORA PLATFORM — COMPLETE ROUTES CATALOG & ARCHITECTURE GUIDE\n\n`;
md += `> **Total Documented Routes**: ${routes.length} Next.js App Router Endpoints  \n`;
md += `> **Architecture**: Multi-Portal Role-Based Domain Architecture (Customer, Provider Studio, Delivery Valet, Admin/Operations)  \n`;
md += `> **Generated On**: 2026-09-21  \n\n`;

md += `## Portal Distribution Summary\n\n`;
md += `| Portal / Domain | Route Prefix | Total Routes | Primary Users | Key Responsibility |\n`;
md += `| :--- | :--- | :---: | :--- | :--- |\n`;
md += `| **Customer Portal** | \`/customer\` | ${categorized['Customer'].length} | Consumers & Fabric Owners | Discovery, Service Selection, Booking, Tracking, Reviews, Rewards |\n`;
md += `| **Provider Studio Portal** | \`/provider\` | ${categorized['Provider'].length} | Workshop Owners & Specialists | Order Intake, Fabric Inspection, Cleaning Pipeline, Capacity, Earnings |\n`;
md += `| **Delivery Valet Portal** | \`/delivery-partner\` | ${categorized['Delivery Partner'].length} | Logistics Drivers & Valets | Doorstep Pickups, Route Navigation, Workshop Handoffs, Proof of Delivery |\n`;
md += `| **Admin & Operations** | \`/admin\` | ${categorized['Admin & Operations'].length} | Operations, Finance, Support, Executives | Platform Governance, Fleet Dispatch, Financial Ledger, Disputes, KYC |\n`;
md += `| **General / Gateway** | \`/\` | ${categorized['General / Root'].length} | All Visitors | Root Entrypoint & Redirection |\n`;
md += `| **TOTAL** | | **${routes.length}** | | Full-Stack Enterprise Laundry & Specialty Care |\n\n`;

md += `---\n\n`;

for (const [portalName, list] of Object.entries(categorized)) {
  md += `## ${portalName.toUpperCase()} PORTAL (${list.length} Routes)\n\n`;
  md += `| # | Route URL | File Path | Feature / Screen Name | Access Level | Detailed Purpose & Workflow |\n`;
  md += `| :-: | :--- | :--- | :--- | :--- | :--- |\n`;

  list.forEach((item, idx) => {
    md += `| ${idx + 1} | \`${item.routeUrl}\` | \`${item.filePath}\` | **${item.name}** | \`${item.auth}\` | ${item.desc} |\n`;
  });

  md += `\n`;

  md += `### In-Depth Domain Breakdown — ${portalName}\n\n`;
  list.forEach((item, idx) => {
    md += `#### ${idx + 1}. \`${item.routeUrl}\` — ${item.name}\n`;
    md += `- **File**: [\`${item.filePath}\`](file:///d:/portfolio%20pages/laundry/${item.filePath})\n`;
    md += `- **Access Role**: \`${item.auth}\`\n`;
    md += `- **Workflow & Responsibilities**:\n  ${item.desc}\n\n`;
  });

  md += `---\n\n`;
}

fs.writeFileSync('ROUTES_EXPLANATION.md', md, 'utf-8');
console.log('Successfully generated ROUTES_EXPLANATION.md');
