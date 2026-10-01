# WASHORA PLATFORM — COMPLETE ROUTES CATALOG & ARCHITECTURE GUIDE

> **Total Documented Routes**: 171 Next.js App Router Endpoints  
> **Architecture**: Multi-Portal Role-Based Domain Architecture (Customer, Provider Studio, Delivery Valet, Admin/Operations)  
> **Generated On**: 2026-09-21  

## Portal Distribution Summary

| Portal / Domain | Route Prefix | Total Routes | Primary Users | Key Responsibility |
| :--- | :--- | :---: | :--- | :--- |
| **Customer Portal** | `/customer` | 38 | Consumers & Fabric Owners | Discovery, Service Selection, Booking, Tracking, Reviews, Rewards |
| **Provider Studio Portal** | `/provider` | 38 | Workshop Owners & Specialists | Order Intake, Fabric Inspection, Cleaning Pipeline, Capacity, Earnings |
| **Delivery Valet Portal** | `/delivery-partner` | 34 | Logistics Drivers & Valets | Doorstep Pickups, Route Navigation, Workshop Handoffs, Proof of Delivery |
| **Admin & Operations** | `/admin` | 60 | Operations, Finance, Support, Executives | Platform Governance, Fleet Dispatch, Financial Ledger, Disputes, KYC |
| **General / Gateway** | `/` | 1 | All Visitors | Root Entrypoint & Redirection |
| **TOTAL** | | **171** | | Full-Stack Enterprise Laundry & Specialty Care |

---

## CUSTOMER PORTAL (38 Routes)

| # | Route URL | File Path | Feature / Screen Name | Access Level | Detailed Purpose & Workflow |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `/customer/account` | `src/app/customer/account/page.tsx` | **Account Redirector** | `Authenticated (CUSTOMER)` | Convenience redirect route forwarding to /customer/profile. |
| 2 | `/customer/addresses/new` | `src/app/customer/addresses/new/page.tsx` | **Add New Delivery Address** | `Authenticated (CUSTOMER)` | Interactive map picker and address form with pincode and landmark fields. |
| 3 | `/customer/addresses` | `src/app/customer/addresses/page.tsx` | **Saved Delivery Addresses** | `Authenticated (CUSTOMER)` | List of saved Home, Work, and Other addresses with default address switcher and deletion. |
| 4 | `/customer/addresses/[id]/edit` | `src/app/customer/addresses/[id]/edit/page.tsx` | **Edit Saved Address** | `Authenticated (CUSTOMER)` | Update existing address details, apartment number, and delivery instructions. |
| 5 | `/customer/auth/forgot-password` | `src/app/customer/auth/forgot-password/page.tsx` | **Password Recovery Request** | `Public (Guest)` | Request password reset link/code to registered email or mobile number. |
| 6 | `/customer/auth/login` | `src/app/customer/auth/login/page.tsx` | **Customer Login** | `Public (Guest)` | Sign in with email/phone and password or OTP. |
| 7 | `/customer/auth` | `src/app/customer/auth/page.tsx` | **Customer Auth Index** | `Public` | Landing screen routing to login or account registration. |
| 8 | `/customer/auth/register` | `src/app/customer/auth/register/page.tsx` | **Customer Sign Up** | `Public (Guest)` | New customer registration with phone verification. |
| 9 | `/customer/auth/reset-password` | `src/app/customer/auth/reset-password/page.tsx` | **Set New Password** | `Public (Guest)` | Token-based password reset screen with password strength validation. |
| 10 | `/customer/auth/success` | `src/app/customer/auth/success/page.tsx` | **Auth Verification Complete** | `Authenticated (CUSTOMER)` | Successful authentication splash screen auto-redirecting to /customer. |
| 11 | `/customer/auth/verify-phone` | `src/app/customer/auth/verify-phone/page.tsx` | **OTP Phone Verification** | `Public (Guest)` | 6-digit SMS OTP verification screen for mobile number validation. |
| 12 | `/customer/booking` | `src/app/customer/booking/page.tsx` | **4-Step Interactive Booking Stepper** | `Authenticated (CUSTOMER)` | Service configuration, address selection, pickup/delivery scheduling (date chips & time slots), and order review. |
| 13 | `/customer/checkout` | `src/app/customer/checkout/page.tsx` | **Checkout & Bill Summary** | `Authenticated (CUSTOMER)` | Review of service items, pickup slot, delivery address, discount coupon application, and pricing breakdown. |
| 14 | `/customer/coupons` | `src/app/customer/coupons/page.tsx` | **Available Coupons & Vouchers** | `Public / Authenticated` | List of applicable promo codes, discount percentages, and minimum order requirements. |
| 15 | `/customer/location` | `src/app/customer/location/page.tsx` | **Global Location & Area Selector** | `Public` | GPS location auto-detection, postal code lookup, and manual area selection for hyper-local pricing. |
| 16 | `/customer/notifications` | `src/app/customer/notifications/page.tsx` | **Customer Notifications Center** | `Authenticated (CUSTOMER)` | Real-time alerts for booking status changes, driver dispatch, invoices, and promo alerts. |
| 17 | `/customer/notifications/preferences` | `src/app/customer/notifications/preferences/page.tsx` | **Notification Channels & Preferences** | `Authenticated (CUSTOMER)` | Manage push notifications, SMS alerts, WhatsApp updates, and promotional emails. |
| 18 | `/customer/offers` | `src/app/customer/offers/page.tsx` | **Promotions & Loyalty Rewards Hub** | `Public / Authenticated` | Exclusive promo banners, cashback coupons, and loyalty points redemption catalog. |
| 19 | `/customer/order-confirmation` | `src/app/customer/order-confirmation/page.tsx` | **Order Confirmation & Receipt** | `Authenticated (CUSTOMER)` | Post-payment success screen with booking reference ID, summary card, and live tracking launch action. |
| 20 | `/customer/orders` | `src/app/customer/orders/page.tsx` | **My Care Bookings (Active & Past)** | `Authenticated (CUSTOMER)` | Order history list with status tabs (Active vs Past), rebook actions, and direct links to live tracking. |
| 21 | `/customer/orders/[id]/cancel` | `src/app/customer/orders/[id]/cancel/page.tsx` | **Order Cancellation & Refund Estimate** | `Authenticated (CUSTOMER)` | Safe pre-pickup booking cancellation with dynamic refund breakdown calculation. |
| 22 | `/customer/orders/[id]/dispute` | `src/app/customer/orders/[id]/dispute/page.tsx` | **File Service Dispute / Grievance** | `Authenticated (CUSTOMER)` | Dispute filing workflow for damaged items or missed items with photo uploads. |
| 23 | `/customer/orders/[id]` | `src/app/customer/orders/[id]/page.tsx` | **8-Stage Live Order Tracking** | `Authenticated (CUSTOMER)` | Real-time 8-stage progress tracker from valet pickup en route to workshop inspection, cleaning, QC, and delivery. |
| 24 | `/customer/orders/[id]/receipt` | `src/app/customer/orders/[id]/receipt/page.tsx` | **Tax Invoice & Payment Receipt** | `Authenticated (CUSTOMER)` | Itemized invoice download and view with GST breakdown and transaction proofs. |
| 25 | `/customer/orders/[id]/reschedule` | `src/app/customer/orders/[id]/reschedule/page.tsx` | **Reschedule Pickup / Delivery Slot** | `Authenticated (CUSTOMER)` | Customer self-service calendar slot modification before driver is dispatched. |
| 26 | `/customer/orders/[id]/review` | `src/app/customer/orders/[id]/review/page.tsx` | **Post-Service Rating & Review** | `Authenticated (CUSTOMER)` | 1-5 star review submission with photo attachments and feedback for the studio and driver. |
| 27 | `/customer` | `src/app/customer/page.tsx` | **Customer Home & Discovery Feed** | `Public / Optional Auth` | District-inspired location-first consumer discovery feed with horizontal category rails, prominent search, active orders, and studio highlights. |
| 28 | `/customer/payment` | `src/app/customer/payment/page.tsx` | **Payment Processing Gateway** | `Authenticated (CUSTOMER)` | Secure payment screen supporting UPI, Credit/Debit Cards, Netbanking, and Cash-on-Delivery with double-entry ledger integration. |
| 29 | `/customer/profile/edit` | `src/app/customer/profile/edit/page.tsx` | **Edit Personal Details** | `Authenticated (CUSTOMER)` | Update customer full name, contact phone number, and avatar image. |
| 30 | `/customer/profile` | `src/app/customer/profile/page.tsx` | **Customer Profile & Account Hub** | `Authenticated (CUSTOMER)` | Overview of customer details, loyalty tier status, quick settings links, and logout trigger. |
| 31 | `/customer/profile/security` | `src/app/customer/profile/security/page.tsx` | **Account Security & Password** | `Authenticated (CUSTOMER)` | Change account password, view active login sessions, and configure two-factor authentication. |
| 32 | `/customer/providers` | `src/app/customer/providers/page.tsx` | **Care Studios Directory & Map** | `Public` | Interactive split-view map and list of certified workshop partner studios, ratings, distance, and specialties. |
| 33 | `/customer/providers/[id]` | `src/app/customer/providers/[id]/page.tsx` | **Partner Studio Profile** | `Public` | Studio credentials, certifications, equipment gallery, offered treatments, operating hours, and customer reviews. |
| 34 | `/customer/services` | `src/app/customer/services/page.tsx` | **Specialty Services Catalog** | `Public` | Catalog of all garment, shoe, car, and leather cleaning treatments with category filter pills and search. |
| 35 | `/customer/services/[slug]` | `src/app/customer/services/[slug]/page.tsx` | **Department / Category Overview** | `Public` | Specific department page (e.g., Clothing Care, Shoe Care) with specialty treatment list and pricing. |
| 36 | `/customer/services/[slug]/[itemId]` | `src/app/customer/services/[slug]/[itemId]/page.tsx` | **Service Treatment Detail** | `Public` | Deep-dive product page with photo gallery, variant selector, inclusions/exclusions, provider preview, and booking CTA. |
| 37 | `/customer/support` | `src/app/customer/support/page.tsx` | **Customer Help Center & FAQs** | `Public` | Self-help knowledgebase, searchable FAQs, and direct links to live agent support. |
| 38 | `/customer/support/report-issue` | `src/app/customer/support/report-issue/page.tsx` | **Submit Help Request / Ticket** | `Authenticated (CUSTOMER)` | Formal customer support ticket creation with category tagging and order association. |

### In-Depth Domain Breakdown — Customer

#### 1. `/customer/account` — Account Redirector
- **File**: [`src/app/customer/account/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/account/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Convenience redirect route forwarding to /customer/profile.

#### 2. `/customer/addresses/new` — Add New Delivery Address
- **File**: [`src/app/customer/addresses/new/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/addresses/new/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Interactive map picker and address form with pincode and landmark fields.

#### 3. `/customer/addresses` — Saved Delivery Addresses
- **File**: [`src/app/customer/addresses/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/addresses/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  List of saved Home, Work, and Other addresses with default address switcher and deletion.

#### 4. `/customer/addresses/[id]/edit` — Edit Saved Address
- **File**: [`src/app/customer/addresses/[id]/edit/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/addresses/[id]/edit/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Update existing address details, apartment number, and delivery instructions.

#### 5. `/customer/auth/forgot-password` — Password Recovery Request
- **File**: [`src/app/customer/auth/forgot-password/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/auth/forgot-password/page.tsx)
- **Access Role**: `Public (Guest)`
- **Workflow & Responsibilities**:
  Request password reset link/code to registered email or mobile number.

#### 6. `/customer/auth/login` — Customer Login
- **File**: [`src/app/customer/auth/login/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/auth/login/page.tsx)
- **Access Role**: `Public (Guest)`
- **Workflow & Responsibilities**:
  Sign in with email/phone and password or OTP.

#### 7. `/customer/auth` — Customer Auth Index
- **File**: [`src/app/customer/auth/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/auth/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  Landing screen routing to login or account registration.

#### 8. `/customer/auth/register` — Customer Sign Up
- **File**: [`src/app/customer/auth/register/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/auth/register/page.tsx)
- **Access Role**: `Public (Guest)`
- **Workflow & Responsibilities**:
  New customer registration with phone verification.

#### 9. `/customer/auth/reset-password` — Set New Password
- **File**: [`src/app/customer/auth/reset-password/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/auth/reset-password/page.tsx)
- **Access Role**: `Public (Guest)`
- **Workflow & Responsibilities**:
  Token-based password reset screen with password strength validation.

#### 10. `/customer/auth/success` — Auth Verification Complete
- **File**: [`src/app/customer/auth/success/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/auth/success/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Successful authentication splash screen auto-redirecting to /customer.

#### 11. `/customer/auth/verify-phone` — OTP Phone Verification
- **File**: [`src/app/customer/auth/verify-phone/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/auth/verify-phone/page.tsx)
- **Access Role**: `Public (Guest)`
- **Workflow & Responsibilities**:
  6-digit SMS OTP verification screen for mobile number validation.

#### 12. `/customer/booking` — 4-Step Interactive Booking Stepper
- **File**: [`src/app/customer/booking/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/booking/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Service configuration, address selection, pickup/delivery scheduling (date chips & time slots), and order review.

#### 13. `/customer/checkout` — Checkout & Bill Summary
- **File**: [`src/app/customer/checkout/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/checkout/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Review of service items, pickup slot, delivery address, discount coupon application, and pricing breakdown.

#### 14. `/customer/coupons` — Available Coupons & Vouchers
- **File**: [`src/app/customer/coupons/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/coupons/page.tsx)
- **Access Role**: `Public / Authenticated`
- **Workflow & Responsibilities**:
  List of applicable promo codes, discount percentages, and minimum order requirements.

#### 15. `/customer/location` — Global Location & Area Selector
- **File**: [`src/app/customer/location/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/location/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  GPS location auto-detection, postal code lookup, and manual area selection for hyper-local pricing.

#### 16. `/customer/notifications` — Customer Notifications Center
- **File**: [`src/app/customer/notifications/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/notifications/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Real-time alerts for booking status changes, driver dispatch, invoices, and promo alerts.

#### 17. `/customer/notifications/preferences` — Notification Channels & Preferences
- **File**: [`src/app/customer/notifications/preferences/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/notifications/preferences/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Manage push notifications, SMS alerts, WhatsApp updates, and promotional emails.

#### 18. `/customer/offers` — Promotions & Loyalty Rewards Hub
- **File**: [`src/app/customer/offers/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/offers/page.tsx)
- **Access Role**: `Public / Authenticated`
- **Workflow & Responsibilities**:
  Exclusive promo banners, cashback coupons, and loyalty points redemption catalog.

#### 19. `/customer/order-confirmation` — Order Confirmation & Receipt
- **File**: [`src/app/customer/order-confirmation/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/order-confirmation/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Post-payment success screen with booking reference ID, summary card, and live tracking launch action.

#### 20. `/customer/orders` — My Care Bookings (Active & Past)
- **File**: [`src/app/customer/orders/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/orders/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Order history list with status tabs (Active vs Past), rebook actions, and direct links to live tracking.

#### 21. `/customer/orders/[id]/cancel` — Order Cancellation & Refund Estimate
- **File**: [`src/app/customer/orders/[id]/cancel/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/orders/[id]/cancel/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Safe pre-pickup booking cancellation with dynamic refund breakdown calculation.

#### 22. `/customer/orders/[id]/dispute` — File Service Dispute / Grievance
- **File**: [`src/app/customer/orders/[id]/dispute/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/orders/[id]/dispute/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Dispute filing workflow for damaged items or missed items with photo uploads.

#### 23. `/customer/orders/[id]` — 8-Stage Live Order Tracking
- **File**: [`src/app/customer/orders/[id]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/orders/[id]/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Real-time 8-stage progress tracker from valet pickup en route to workshop inspection, cleaning, QC, and delivery.

#### 24. `/customer/orders/[id]/receipt` — Tax Invoice & Payment Receipt
- **File**: [`src/app/customer/orders/[id]/receipt/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/orders/[id]/receipt/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Itemized invoice download and view with GST breakdown and transaction proofs.

#### 25. `/customer/orders/[id]/reschedule` — Reschedule Pickup / Delivery Slot
- **File**: [`src/app/customer/orders/[id]/reschedule/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/orders/[id]/reschedule/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Customer self-service calendar slot modification before driver is dispatched.

#### 26. `/customer/orders/[id]/review` — Post-Service Rating & Review
- **File**: [`src/app/customer/orders/[id]/review/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/orders/[id]/review/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  1-5 star review submission with photo attachments and feedback for the studio and driver.

#### 27. `/customer` — Customer Home & Discovery Feed
- **File**: [`src/app/customer/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/page.tsx)
- **Access Role**: `Public / Optional Auth`
- **Workflow & Responsibilities**:
  District-inspired location-first consumer discovery feed with horizontal category rails, prominent search, active orders, and studio highlights.

#### 28. `/customer/payment` — Payment Processing Gateway
- **File**: [`src/app/customer/payment/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/payment/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Secure payment screen supporting UPI, Credit/Debit Cards, Netbanking, and Cash-on-Delivery with double-entry ledger integration.

#### 29. `/customer/profile/edit` — Edit Personal Details
- **File**: [`src/app/customer/profile/edit/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/profile/edit/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Update customer full name, contact phone number, and avatar image.

#### 30. `/customer/profile` — Customer Profile & Account Hub
- **File**: [`src/app/customer/profile/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/profile/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Overview of customer details, loyalty tier status, quick settings links, and logout trigger.

#### 31. `/customer/profile/security` — Account Security & Password
- **File**: [`src/app/customer/profile/security/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/profile/security/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Change account password, view active login sessions, and configure two-factor authentication.

#### 32. `/customer/providers` — Care Studios Directory & Map
- **File**: [`src/app/customer/providers/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/providers/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  Interactive split-view map and list of certified workshop partner studios, ratings, distance, and specialties.

#### 33. `/customer/providers/[id]` — Partner Studio Profile
- **File**: [`src/app/customer/providers/[id]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/providers/[id]/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  Studio credentials, certifications, equipment gallery, offered treatments, operating hours, and customer reviews.

#### 34. `/customer/services` — Specialty Services Catalog
- **File**: [`src/app/customer/services/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/services/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  Catalog of all garment, shoe, car, and leather cleaning treatments with category filter pills and search.

#### 35. `/customer/services/[slug]` — Department / Category Overview
- **File**: [`src/app/customer/services/[slug]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/services/[slug]/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  Specific department page (e.g., Clothing Care, Shoe Care) with specialty treatment list and pricing.

#### 36. `/customer/services/[slug]/[itemId]` — Service Treatment Detail
- **File**: [`src/app/customer/services/[slug]/[itemId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/services/[slug]/[itemId]/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  Deep-dive product page with photo gallery, variant selector, inclusions/exclusions, provider preview, and booking CTA.

#### 37. `/customer/support` — Customer Help Center & FAQs
- **File**: [`src/app/customer/support/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/support/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  Self-help knowledgebase, searchable FAQs, and direct links to live agent support.

#### 38. `/customer/support/report-issue` — Submit Help Request / Ticket
- **File**: [`src/app/customer/support/report-issue/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/customer/support/report-issue/page.tsx)
- **Access Role**: `Authenticated (CUSTOMER)`
- **Workflow & Responsibilities**:
  Formal customer support ticket creation with category tagging and order association.

---

## PROVIDER PORTAL (38 Routes)

| # | Route URL | File Path | Feature / Screen Name | Access Level | Detailed Purpose & Workflow |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `/provider/account` | `src/app/provider/account/page.tsx` | **Studio Business Profile & Facility** | `Authenticated (PROVIDER)` | Studio name, branding images, facility address, contact numbers, and equipment details. |
| 2 | `/provider/auth/forgot-password` | `src/app/provider/auth/forgot-password/page.tsx` | **Provider Authentication & Access** | `Public / Guest` | Partner portal login, workshop staff registration, and password recovery. |
| 3 | `/provider/auth/login` | `src/app/provider/auth/login/page.tsx` | **Provider Authentication & Access** | `Public / Guest` | Partner portal login, workshop staff registration, and password recovery. |
| 4 | `/provider/auth/register` | `src/app/provider/auth/register/page.tsx` | **Provider Authentication & Access** | `Public / Guest` | Partner portal login, workshop staff registration, and password recovery. |
| 5 | `/provider/auth/reset-password` | `src/app/provider/auth/reset-password/page.tsx` | **Provider Authentication & Access** | `Public / Guest` | Partner portal login, workshop staff registration, and password recovery. |
| 6 | `/provider/auth/verify-phone` | `src/app/provider/auth/verify-phone/page.tsx` | **Provider Authentication & Access** | `Public / Guest` | Partner portal login, workshop staff registration, and password recovery. |
| 7 | `/provider/availability` | `src/app/provider/availability/page.tsx` | **Workshop Hours & Daily Capacity** | `Authenticated (PROVIDER)` | Configure operating days, weekly working shifts, maximum garment capacity, and holiday blackout dates. |
| 8 | `/provider/bookings` | `src/app/provider/bookings/page.tsx` | **Upcoming Bookings & Capacity** | `Authenticated (PROVIDER)` | Scheduled garment arrivals, load forecasting, and intake scheduling. |
| 9 | `/provider/bookings/[bookingId]` | `src/app/provider/bookings/[bookingId]/page.tsx` | **Booking Intake Details** | `Authenticated (PROVIDER)` | Pre-inspection booking manifest with customer special instructions. |
| 10 | `/provider/dashboard` | `src/app/provider/dashboard/page.tsx` | **Provider Studio Operations Dashboard** | `Authenticated (PROVIDER)` | KPI metrics overview: active garments in workshop, capacity utilization, pending intakes, and daily revenue. |
| 11 | `/provider/earnings` | `src/app/provider/earnings/page.tsx` | **Studio Revenue & Financial Statement** | `Authenticated (PROVIDER)` | Gross billings, platform commission deductions, net receivables, and settlement statements. |
| 12 | `/provider/handover` | `src/app/provider/handover/page.tsx` | **Ready for Delivery Outbound Handoff** | `Authenticated (PROVIDER)` | Finished, packaged garments waiting for valet drivers to pick up and deliver. |
| 13 | `/provider/handover/[handoverId]` | `src/app/provider/handover/[handoverId]/page.tsx` | **Outbound Driver Handoff Verification** | `Authenticated (PROVIDER)` | OTP & barcode confirmation when handing over completed garments to delivery valet. |
| 14 | `/provider/notifications` | `src/app/provider/notifications/page.tsx` | **Provider Alerts & Notification Preferences** | `Authenticated (PROVIDER)` | Urgent order alerts, capacity warnings, payout notifications, and dispatch updates. |
| 15 | `/provider/notifications/preferences` | `src/app/provider/notifications/preferences/page.tsx` | **Provider Alerts & Notification Preferences** | `Authenticated (PROVIDER)` | Urgent order alerts, capacity warnings, payout notifications, and dispatch updates. |
| 16 | `/provider/onboarding` | `src/app/provider/onboarding/page.tsx` | **Provider Studio Verification & KYC** | `Authenticated (PROVIDER)` | Business license upload, GSTIN verification, workshop equipment audit, and approval status. |
| 17 | `/provider/onboarding/status` | `src/app/provider/onboarding/status/page.tsx` | **Provider Studio Verification & KYC** | `Authenticated (PROVIDER)` | Business license upload, GSTIN verification, workshop equipment audit, and approval status. |
| 18 | `/provider/orders` | `src/app/provider/orders/page.tsx` | **Workshop Orders & Pipeline** | `Authenticated (PROVIDER)` | Kanban & list of cleaning orders across inspection, washing, pressing, and quality-check stages. |
| 19 | `/provider/orders/[orderId]` | `src/app/provider/orders/[orderId]/page.tsx` | **Order Workshop Processing & QA** | `Authenticated (PROVIDER)` | Detailed item-level intake inspection, fabric defect tagging, treatment log, and stage transitions. |
| 20 | `/provider` | `src/app/provider/page.tsx` | **Provider Studio Operations Dashboard** | `Authenticated (PROVIDER)` | KPI metrics overview: active garments in workshop, capacity utilization, pending intakes, and daily revenue. |
| 21 | `/provider/payouts` | `src/app/provider/payouts/page.tsx` | **Bank Payouts & Settlement History** | `Authenticated (PROVIDER)` | Automated bank account disbursements, payout status, and transaction reference numbers. |
| 22 | `/provider/pickup` | `src/app/provider/pickup/page.tsx` | **Driver Inbound Pickups Management** | `Authenticated (PROVIDER)` | Coordination of valet delivery arrivals carrying dirty laundry to the workshop. |
| 23 | `/provider/pickup/[pickupId]` | `src/app/provider/pickup/[pickupId]/page.tsx` | **Inbound Bag Manifest & Verification** | `Authenticated (PROVIDER)` | Barcode scanning and bag intake verification from delivery driver. |
| 24 | `/provider/pickups` | `src/app/provider/pickups/page.tsx` | **Driver Inbound Pickups Management** | `Authenticated (PROVIDER)` | Coordination of valet delivery arrivals carrying dirty laundry to the workshop. |
| 25 | `/provider/pickups/[pickupId]` | `src/app/provider/pickups/[pickupId]/page.tsx` | **Inbound Bag Manifest & Verification** | `Authenticated (PROVIDER)` | Barcode scanning and bag intake verification from delivery driver. |
| 26 | `/provider/profile` | `src/app/provider/profile/page.tsx` | **Studio Business Profile & Facility** | `Authenticated (PROVIDER)` | Studio name, branding images, facility address, contact numbers, and equipment details. |
| 27 | `/provider/reviews` | `src/app/provider/reviews/page.tsx` | **Customer Ratings & Feedback** | `Authenticated (PROVIDER)` | Customer satisfaction scores, reviews, and provider public response manager. |
| 28 | `/provider/reviews/[reviewId]` | `src/app/provider/reviews/[reviewId]/page.tsx` | **Individual Review & Dispute Reply** | `Authenticated (PROVIDER)` | Examine detailed customer review and submit official studio response. |
| 29 | `/provider/schedule` | `src/app/provider/schedule/page.tsx` | **Workshop Hours & Daily Capacity** | `Authenticated (PROVIDER)` | Configure operating days, weekly working shifts, maximum garment capacity, and holiday blackout dates. |
| 30 | `/provider/services/new` | `src/app/provider/services/new/page.tsx` | **Create New Treatment Listing** | `Authenticated (PROVIDER)` | Add custom laundry, dry cleaning, or restoration service with tiered pricing. |
| 31 | `/provider/services` | `src/app/provider/services/page.tsx` | **Studio Treatment Catalog & Pricing** | `Authenticated (PROVIDER)` | Manage offered services, custom rates, turnaround promises, and active/inactive status. |
| 32 | `/provider/services/[serviceId]/edit` | `src/app/provider/services/[serviceId]/edit/page.tsx` | **Edit Treatment Parameters** | `Authenticated (PROVIDER)` | Modify pricing, turnaround hours, and service availability. |
| 33 | `/provider/services/[serviceId]` | `src/app/provider/services/[serviceId]/page.tsx` | **Treatment Configuration Details** | `Authenticated (PROVIDER)` | View service details, variant pricing, and performance statistics. |
| 34 | `/provider/settings` | `src/app/provider/settings/page.tsx` | **Studio Operational Settings** | `Authenticated (PROVIDER)` | Auto-accept rules, lead-time buffers, and staff notification toggles. |
| 35 | `/provider/support` | `src/app/provider/support/page.tsx` | **Provider Partner Support & Desk** | `Authenticated (PROVIDER)` | Technical, financial, and operational help requests with WASHORA Partner Operations. |
| 36 | `/provider/support/requests` | `src/app/provider/support/requests/page.tsx` | **Provider Partner Support & Desk** | `Authenticated (PROVIDER)` | Technical, financial, and operational help requests with WASHORA Partner Operations. |
| 37 | `/provider/support/requests/[requestId]` | `src/app/provider/support/requests/[requestId]/page.tsx` | **Provider Partner Support & Desk** | `Authenticated (PROVIDER)` | Technical, financial, and operational help requests with WASHORA Partner Operations. |
| 38 | `/provider/support/[ticketId]` | `src/app/provider/support/[ticketId]/page.tsx` | **Provider Partner Support & Desk** | `Authenticated (PROVIDER)` | Technical, financial, and operational help requests with WASHORA Partner Operations. |

### In-Depth Domain Breakdown — Provider

#### 1. `/provider/account` — Studio Business Profile & Facility
- **File**: [`src/app/provider/account/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/account/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Studio name, branding images, facility address, contact numbers, and equipment details.

#### 2. `/provider/auth/forgot-password` — Provider Authentication & Access
- **File**: [`src/app/provider/auth/forgot-password/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/auth/forgot-password/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Partner portal login, workshop staff registration, and password recovery.

#### 3. `/provider/auth/login` — Provider Authentication & Access
- **File**: [`src/app/provider/auth/login/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/auth/login/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Partner portal login, workshop staff registration, and password recovery.

#### 4. `/provider/auth/register` — Provider Authentication & Access
- **File**: [`src/app/provider/auth/register/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/auth/register/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Partner portal login, workshop staff registration, and password recovery.

#### 5. `/provider/auth/reset-password` — Provider Authentication & Access
- **File**: [`src/app/provider/auth/reset-password/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/auth/reset-password/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Partner portal login, workshop staff registration, and password recovery.

#### 6. `/provider/auth/verify-phone` — Provider Authentication & Access
- **File**: [`src/app/provider/auth/verify-phone/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/auth/verify-phone/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Partner portal login, workshop staff registration, and password recovery.

#### 7. `/provider/availability` — Workshop Hours & Daily Capacity
- **File**: [`src/app/provider/availability/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/availability/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Configure operating days, weekly working shifts, maximum garment capacity, and holiday blackout dates.

#### 8. `/provider/bookings` — Upcoming Bookings & Capacity
- **File**: [`src/app/provider/bookings/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/bookings/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Scheduled garment arrivals, load forecasting, and intake scheduling.

#### 9. `/provider/bookings/[bookingId]` — Booking Intake Details
- **File**: [`src/app/provider/bookings/[bookingId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/bookings/[bookingId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Pre-inspection booking manifest with customer special instructions.

#### 10. `/provider/dashboard` — Provider Studio Operations Dashboard
- **File**: [`src/app/provider/dashboard/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/dashboard/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  KPI metrics overview: active garments in workshop, capacity utilization, pending intakes, and daily revenue.

#### 11. `/provider/earnings` — Studio Revenue & Financial Statement
- **File**: [`src/app/provider/earnings/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/earnings/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Gross billings, platform commission deductions, net receivables, and settlement statements.

#### 12. `/provider/handover` — Ready for Delivery Outbound Handoff
- **File**: [`src/app/provider/handover/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/handover/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Finished, packaged garments waiting for valet drivers to pick up and deliver.

#### 13. `/provider/handover/[handoverId]` — Outbound Driver Handoff Verification
- **File**: [`src/app/provider/handover/[handoverId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/handover/[handoverId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  OTP & barcode confirmation when handing over completed garments to delivery valet.

#### 14. `/provider/notifications` — Provider Alerts & Notification Preferences
- **File**: [`src/app/provider/notifications/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/notifications/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Urgent order alerts, capacity warnings, payout notifications, and dispatch updates.

#### 15. `/provider/notifications/preferences` — Provider Alerts & Notification Preferences
- **File**: [`src/app/provider/notifications/preferences/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/notifications/preferences/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Urgent order alerts, capacity warnings, payout notifications, and dispatch updates.

#### 16. `/provider/onboarding` — Provider Studio Verification & KYC
- **File**: [`src/app/provider/onboarding/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/onboarding/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Business license upload, GSTIN verification, workshop equipment audit, and approval status.

#### 17. `/provider/onboarding/status` — Provider Studio Verification & KYC
- **File**: [`src/app/provider/onboarding/status/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/onboarding/status/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Business license upload, GSTIN verification, workshop equipment audit, and approval status.

#### 18. `/provider/orders` — Workshop Orders & Pipeline
- **File**: [`src/app/provider/orders/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/orders/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Kanban & list of cleaning orders across inspection, washing, pressing, and quality-check stages.

#### 19. `/provider/orders/[orderId]` — Order Workshop Processing & QA
- **File**: [`src/app/provider/orders/[orderId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/orders/[orderId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Detailed item-level intake inspection, fabric defect tagging, treatment log, and stage transitions.

#### 20. `/provider` — Provider Studio Operations Dashboard
- **File**: [`src/app/provider/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  KPI metrics overview: active garments in workshop, capacity utilization, pending intakes, and daily revenue.

#### 21. `/provider/payouts` — Bank Payouts & Settlement History
- **File**: [`src/app/provider/payouts/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/payouts/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Automated bank account disbursements, payout status, and transaction reference numbers.

#### 22. `/provider/pickup` — Driver Inbound Pickups Management
- **File**: [`src/app/provider/pickup/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/pickup/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Coordination of valet delivery arrivals carrying dirty laundry to the workshop.

#### 23. `/provider/pickup/[pickupId]` — Inbound Bag Manifest & Verification
- **File**: [`src/app/provider/pickup/[pickupId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/pickup/[pickupId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Barcode scanning and bag intake verification from delivery driver.

#### 24. `/provider/pickups` — Driver Inbound Pickups Management
- **File**: [`src/app/provider/pickups/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/pickups/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Coordination of valet delivery arrivals carrying dirty laundry to the workshop.

#### 25. `/provider/pickups/[pickupId]` — Inbound Bag Manifest & Verification
- **File**: [`src/app/provider/pickups/[pickupId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/pickups/[pickupId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Barcode scanning and bag intake verification from delivery driver.

#### 26. `/provider/profile` — Studio Business Profile & Facility
- **File**: [`src/app/provider/profile/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/profile/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Studio name, branding images, facility address, contact numbers, and equipment details.

#### 27. `/provider/reviews` — Customer Ratings & Feedback
- **File**: [`src/app/provider/reviews/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/reviews/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Customer satisfaction scores, reviews, and provider public response manager.

#### 28. `/provider/reviews/[reviewId]` — Individual Review & Dispute Reply
- **File**: [`src/app/provider/reviews/[reviewId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/reviews/[reviewId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Examine detailed customer review and submit official studio response.

#### 29. `/provider/schedule` — Workshop Hours & Daily Capacity
- **File**: [`src/app/provider/schedule/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/schedule/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Configure operating days, weekly working shifts, maximum garment capacity, and holiday blackout dates.

#### 30. `/provider/services/new` — Create New Treatment Listing
- **File**: [`src/app/provider/services/new/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/services/new/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Add custom laundry, dry cleaning, or restoration service with tiered pricing.

#### 31. `/provider/services` — Studio Treatment Catalog & Pricing
- **File**: [`src/app/provider/services/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/services/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Manage offered services, custom rates, turnaround promises, and active/inactive status.

#### 32. `/provider/services/[serviceId]/edit` — Edit Treatment Parameters
- **File**: [`src/app/provider/services/[serviceId]/edit/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/services/[serviceId]/edit/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Modify pricing, turnaround hours, and service availability.

#### 33. `/provider/services/[serviceId]` — Treatment Configuration Details
- **File**: [`src/app/provider/services/[serviceId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/services/[serviceId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  View service details, variant pricing, and performance statistics.

#### 34. `/provider/settings` — Studio Operational Settings
- **File**: [`src/app/provider/settings/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/settings/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Auto-accept rules, lead-time buffers, and staff notification toggles.

#### 35. `/provider/support` — Provider Partner Support & Desk
- **File**: [`src/app/provider/support/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/support/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Technical, financial, and operational help requests with WASHORA Partner Operations.

#### 36. `/provider/support/requests` — Provider Partner Support & Desk
- **File**: [`src/app/provider/support/requests/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/support/requests/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Technical, financial, and operational help requests with WASHORA Partner Operations.

#### 37. `/provider/support/requests/[requestId]` — Provider Partner Support & Desk
- **File**: [`src/app/provider/support/requests/[requestId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/support/requests/[requestId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Technical, financial, and operational help requests with WASHORA Partner Operations.

#### 38. `/provider/support/[ticketId]` — Provider Partner Support & Desk
- **File**: [`src/app/provider/support/[ticketId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/provider/support/[ticketId]/page.tsx)
- **Access Role**: `Authenticated (PROVIDER)`
- **Workflow & Responsibilities**:
  Technical, financial, and operational help requests with WASHORA Partner Operations.

---

## DELIVERY PARTNER PORTAL (34 Routes)

| # | Route URL | File Path | Feature / Screen Name | Access Level | Detailed Purpose & Workflow |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `/delivery-partner/account` | `src/app/delivery-partner/account/page.tsx` | **Driver Profile & Emergency Contacts** | `Authenticated (DELIVERY_PARTNER)` | Personal information, registered vehicle details, and emergency SOS contacts. |
| 2 | `/delivery-partner/auth/forgot-password` | `src/app/delivery-partner/auth/forgot-password/page.tsx` | **Driver Authentication & Onboarding** | `Public / Guest` | Secure driver login, registration, phone verification, and credential recovery. |
| 3 | `/delivery-partner/auth/login` | `src/app/delivery-partner/auth/login/page.tsx` | **Driver Authentication & Onboarding** | `Public / Guest` | Secure driver login, registration, phone verification, and credential recovery. |
| 4 | `/delivery-partner/auth/register` | `src/app/delivery-partner/auth/register/page.tsx` | **Driver Authentication & Onboarding** | `Public / Guest` | Secure driver login, registration, phone verification, and credential recovery. |
| 5 | `/delivery-partner/auth/reset-password` | `src/app/delivery-partner/auth/reset-password/page.tsx` | **Driver Authentication & Onboarding** | `Public / Guest` | Secure driver login, registration, phone verification, and credential recovery. |
| 6 | `/delivery-partner/auth/verify-phone` | `src/app/delivery-partner/auth/verify-phone/page.tsx` | **Driver Authentication & Onboarding** | `Public / Guest` | Secure driver login, registration, phone verification, and credential recovery. |
| 7 | `/delivery-partner/dashboard` | `src/app/delivery-partner/dashboard/page.tsx` | **Delivery Valet Dashboard & Live Run** | `Authenticated (DELIVERY_PARTNER)` | Active job queue, shift status (Online/Offline toggle), daily earnings, and completion stats. |
| 8 | `/delivery-partner/deliveries` | `src/app/delivery-partner/deliveries/page.tsx` | **Active Delivery Route & Batch Tasks** | `Authenticated (DELIVERY_PARTNER)` | Optimized multi-stop delivery route view with estimated arrival times. |
| 9 | `/delivery-partner/deliveries/[taskId]` | `src/app/delivery-partner/deliveries/[taskId]/page.tsx` | **Active Delivery Route & Batch Tasks** | `Authenticated (DELIVERY_PARTNER)` | Optimized multi-stop delivery route view with estimated arrival times. |
| 10 | `/delivery-partner/delivery` | `src/app/delivery-partner/delivery/page.tsx` | **Completed Order Delivery Handoff** | `Authenticated (DELIVERY_PARTNER)` | Turn-by-turn navigation to doorstep, proof-of-delivery photo capture, and handover confirmation. |
| 11 | `/delivery-partner/delivery/[taskId]` | `src/app/delivery-partner/delivery/[taskId]/page.tsx` | **Completed Order Delivery Handoff** | `Authenticated (DELIVERY_PARTNER)` | Turn-by-turn navigation to doorstep, proof-of-delivery photo capture, and handover confirmation. |
| 12 | `/delivery-partner/earnings` | `src/app/delivery-partner/earnings/page.tsx` | **Daily & Weekly Valet Earnings** | `Authenticated (DELIVERY_PARTNER)` | Base pay, distance allowance, tip ledger, peak incentives, and weekly payout summaries. |
| 13 | `/delivery-partner/earnings/[earningId]` | `src/app/delivery-partner/earnings/[earningId]/page.tsx` | **Daily & Weekly Valet Earnings** | `Authenticated (DELIVERY_PARTNER)` | Base pay, distance allowance, tip ledger, peak incentives, and weekly payout summaries. |
| 14 | `/delivery-partner/history` | `src/app/delivery-partner/history/page.tsx` | **Valet Trip History & Proofs** | `Authenticated (DELIVERY_PARTNER)` | Historical list of all completed pickups and drop-offs with digital signature proofs. |
| 15 | `/delivery-partner/history/[deliveryId]` | `src/app/delivery-partner/history/[deliveryId]/page.tsx` | **Valet Trip History & Proofs** | `Authenticated (DELIVERY_PARTNER)` | Historical list of all completed pickups and drop-offs with digital signature proofs. |
| 16 | `/delivery-partner/notifications` | `src/app/delivery-partner/notifications/page.tsx` | **Dispatch & Surge Alerts** | `Authenticated (DELIVERY_PARTNER)` | Instant notifications for new nearby job requests, route reroutes, and urgent cancellations. |
| 17 | `/delivery-partner/notifications/[notificationId]` | `src/app/delivery-partner/notifications/[notificationId]/page.tsx` | **Dispatch & Surge Alerts** | `Authenticated (DELIVERY_PARTNER)` | Instant notifications for new nearby job requests, route reroutes, and urgent cancellations. |
| 18 | `/delivery-partner/onboarding` | `src/app/delivery-partner/onboarding/page.tsx` | **Driver Onboarding & License KYC** | `Authenticated (DELIVERY_PARTNER)` | Driver license upload, vehicle RC, criminal background verification, and training modules. |
| 19 | `/delivery-partner/onboarding/status` | `src/app/delivery-partner/onboarding/status/page.tsx` | **Driver Onboarding & License KYC** | `Authenticated (DELIVERY_PARTNER)` | Driver license upload, vehicle RC, criminal background verification, and training modules. |
| 20 | `/delivery-partner` | `src/app/delivery-partner/page.tsx` | **Delivery Valet Dashboard & Live Run** | `Authenticated (DELIVERY_PARTNER)` | Active job queue, shift status (Online/Offline toggle), daily earnings, and completion stats. |
| 21 | `/delivery-partner/payouts` | `src/app/delivery-partner/payouts/page.tsx` | **Driver Bank Payout Receipts** | `Authenticated (DELIVERY_PARTNER)` | Direct UPI/Bank account deposit records and settlement statements. |
| 22 | `/delivery-partner/payouts/[payoutId]` | `src/app/delivery-partner/payouts/[payoutId]/page.tsx` | **Driver Bank Payout Receipts** | `Authenticated (DELIVERY_PARTNER)` | Direct UPI/Bank account deposit records and settlement statements. |
| 23 | `/delivery-partner/pickup` | `src/app/delivery-partner/pickup/page.tsx` | **Customer Doorstep Pickup Flow** | `Authenticated (DELIVERY_PARTNER)` | Navigation to customer address, bag barcode scan, intake verification, and customer OTP sign-off. |
| 24 | `/delivery-partner/pickup/[taskId]` | `src/app/delivery-partner/pickup/[taskId]/page.tsx` | **Customer Doorstep Pickup Flow** | `Authenticated (DELIVERY_PARTNER)` | Navigation to customer address, bag barcode scan, intake verification, and customer OTP sign-off. |
| 25 | `/delivery-partner/profile` | `src/app/delivery-partner/profile/page.tsx` | **Driver Profile & Emergency Contacts** | `Authenticated (DELIVERY_PARTNER)` | Personal information, registered vehicle details, and emergency SOS contacts. |
| 26 | `/delivery-partner/reviews` | `src/app/delivery-partner/reviews/page.tsx` | **Driver Service Ratings & Badges** | `Authenticated (DELIVERY_PARTNER)` | Customer ratings for punctuality, handling care, and etiquette with performance tier badges. |
| 27 | `/delivery-partner/reviews/[reviewId]` | `src/app/delivery-partner/reviews/[reviewId]/page.tsx` | **Driver Service Ratings & Badges** | `Authenticated (DELIVERY_PARTNER)` | Customer ratings for punctuality, handling care, and etiquette with performance tier badges. |
| 28 | `/delivery-partner/route` | `src/app/delivery-partner/route/page.tsx` | **Live GPS Multi-Stop Navigation Map** | `Authenticated (DELIVERY_PARTNER)` | Map overview plotting optimal transit between customer homes and partner workshops. |
| 29 | `/delivery-partner/schedule` | `src/app/delivery-partner/schedule/page.tsx` | **Delivery Shift & Slot Planner** | `Authenticated (DELIVERY_PARTNER)` | Book working time slots and select preferred operating service zones. |
| 30 | `/delivery-partner/settings` | `src/app/delivery-partner/settings/page.tsx` | **Valet App Preferences** | `Authenticated (DELIVERY_PARTNER)` | Navigation app choice (Google Maps vs Waze), audio alert tones, and battery saver settings. |
| 31 | `/delivery-partner/support` | `src/app/delivery-partner/support/page.tsx` | **Driver Roadside & Order Assistance** | `Authenticated (DELIVERY_PARTNER)` | Live dispatch hotline, customer unreachable reporting, and vehicle breakdown assistance. |
| 32 | `/delivery-partner/support/requests/[ticketId]` | `src/app/delivery-partner/support/requests/[ticketId]/page.tsx` | **Driver Roadside & Order Assistance** | `Authenticated (DELIVERY_PARTNER)` | Live dispatch hotline, customer unreachable reporting, and vehicle breakdown assistance. |
| 33 | `/delivery-partner/tasks` | `src/app/delivery-partner/tasks/page.tsx` | **Available & Assigned Logistics Jobs** | `Authenticated (DELIVERY_PARTNER)` | List of customer doorstep pickups and workshop delivery drop-offs. |
| 34 | `/delivery-partner/tasks/[taskId]` | `src/app/delivery-partner/tasks/[taskId]/page.tsx` | **Task Dispatch & Order Overview** | `Authenticated (DELIVERY_PARTNER)` | Job details, customer contact, item count estimate, and accept/reject action. |

### In-Depth Domain Breakdown — Delivery Partner

#### 1. `/delivery-partner/account` — Driver Profile & Emergency Contacts
- **File**: [`src/app/delivery-partner/account/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/account/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Personal information, registered vehicle details, and emergency SOS contacts.

#### 2. `/delivery-partner/auth/forgot-password` — Driver Authentication & Onboarding
- **File**: [`src/app/delivery-partner/auth/forgot-password/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/auth/forgot-password/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Secure driver login, registration, phone verification, and credential recovery.

#### 3. `/delivery-partner/auth/login` — Driver Authentication & Onboarding
- **File**: [`src/app/delivery-partner/auth/login/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/auth/login/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Secure driver login, registration, phone verification, and credential recovery.

#### 4. `/delivery-partner/auth/register` — Driver Authentication & Onboarding
- **File**: [`src/app/delivery-partner/auth/register/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/auth/register/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Secure driver login, registration, phone verification, and credential recovery.

#### 5. `/delivery-partner/auth/reset-password` — Driver Authentication & Onboarding
- **File**: [`src/app/delivery-partner/auth/reset-password/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/auth/reset-password/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Secure driver login, registration, phone verification, and credential recovery.

#### 6. `/delivery-partner/auth/verify-phone` — Driver Authentication & Onboarding
- **File**: [`src/app/delivery-partner/auth/verify-phone/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/auth/verify-phone/page.tsx)
- **Access Role**: `Public / Guest`
- **Workflow & Responsibilities**:
  Secure driver login, registration, phone verification, and credential recovery.

#### 7. `/delivery-partner/dashboard` — Delivery Valet Dashboard & Live Run
- **File**: [`src/app/delivery-partner/dashboard/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/dashboard/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Active job queue, shift status (Online/Offline toggle), daily earnings, and completion stats.

#### 8. `/delivery-partner/deliveries` — Active Delivery Route & Batch Tasks
- **File**: [`src/app/delivery-partner/deliveries/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/deliveries/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Optimized multi-stop delivery route view with estimated arrival times.

#### 9. `/delivery-partner/deliveries/[taskId]` — Active Delivery Route & Batch Tasks
- **File**: [`src/app/delivery-partner/deliveries/[taskId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/deliveries/[taskId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Optimized multi-stop delivery route view with estimated arrival times.

#### 10. `/delivery-partner/delivery` — Completed Order Delivery Handoff
- **File**: [`src/app/delivery-partner/delivery/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/delivery/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Turn-by-turn navigation to doorstep, proof-of-delivery photo capture, and handover confirmation.

#### 11. `/delivery-partner/delivery/[taskId]` — Completed Order Delivery Handoff
- **File**: [`src/app/delivery-partner/delivery/[taskId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/delivery/[taskId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Turn-by-turn navigation to doorstep, proof-of-delivery photo capture, and handover confirmation.

#### 12. `/delivery-partner/earnings` — Daily & Weekly Valet Earnings
- **File**: [`src/app/delivery-partner/earnings/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/earnings/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Base pay, distance allowance, tip ledger, peak incentives, and weekly payout summaries.

#### 13. `/delivery-partner/earnings/[earningId]` — Daily & Weekly Valet Earnings
- **File**: [`src/app/delivery-partner/earnings/[earningId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/earnings/[earningId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Base pay, distance allowance, tip ledger, peak incentives, and weekly payout summaries.

#### 14. `/delivery-partner/history` — Valet Trip History & Proofs
- **File**: [`src/app/delivery-partner/history/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/history/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Historical list of all completed pickups and drop-offs with digital signature proofs.

#### 15. `/delivery-partner/history/[deliveryId]` — Valet Trip History & Proofs
- **File**: [`src/app/delivery-partner/history/[deliveryId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/history/[deliveryId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Historical list of all completed pickups and drop-offs with digital signature proofs.

#### 16. `/delivery-partner/notifications` — Dispatch & Surge Alerts
- **File**: [`src/app/delivery-partner/notifications/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/notifications/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Instant notifications for new nearby job requests, route reroutes, and urgent cancellations.

#### 17. `/delivery-partner/notifications/[notificationId]` — Dispatch & Surge Alerts
- **File**: [`src/app/delivery-partner/notifications/[notificationId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/notifications/[notificationId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Instant notifications for new nearby job requests, route reroutes, and urgent cancellations.

#### 18. `/delivery-partner/onboarding` — Driver Onboarding & License KYC
- **File**: [`src/app/delivery-partner/onboarding/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/onboarding/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Driver license upload, vehicle RC, criminal background verification, and training modules.

#### 19. `/delivery-partner/onboarding/status` — Driver Onboarding & License KYC
- **File**: [`src/app/delivery-partner/onboarding/status/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/onboarding/status/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Driver license upload, vehicle RC, criminal background verification, and training modules.

#### 20. `/delivery-partner` — Delivery Valet Dashboard & Live Run
- **File**: [`src/app/delivery-partner/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Active job queue, shift status (Online/Offline toggle), daily earnings, and completion stats.

#### 21. `/delivery-partner/payouts` — Driver Bank Payout Receipts
- **File**: [`src/app/delivery-partner/payouts/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/payouts/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Direct UPI/Bank account deposit records and settlement statements.

#### 22. `/delivery-partner/payouts/[payoutId]` — Driver Bank Payout Receipts
- **File**: [`src/app/delivery-partner/payouts/[payoutId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/payouts/[payoutId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Direct UPI/Bank account deposit records and settlement statements.

#### 23. `/delivery-partner/pickup` — Customer Doorstep Pickup Flow
- **File**: [`src/app/delivery-partner/pickup/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/pickup/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Navigation to customer address, bag barcode scan, intake verification, and customer OTP sign-off.

#### 24. `/delivery-partner/pickup/[taskId]` — Customer Doorstep Pickup Flow
- **File**: [`src/app/delivery-partner/pickup/[taskId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/pickup/[taskId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Navigation to customer address, bag barcode scan, intake verification, and customer OTP sign-off.

#### 25. `/delivery-partner/profile` — Driver Profile & Emergency Contacts
- **File**: [`src/app/delivery-partner/profile/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/profile/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Personal information, registered vehicle details, and emergency SOS contacts.

#### 26. `/delivery-partner/reviews` — Driver Service Ratings & Badges
- **File**: [`src/app/delivery-partner/reviews/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/reviews/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Customer ratings for punctuality, handling care, and etiquette with performance tier badges.

#### 27. `/delivery-partner/reviews/[reviewId]` — Driver Service Ratings & Badges
- **File**: [`src/app/delivery-partner/reviews/[reviewId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/reviews/[reviewId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Customer ratings for punctuality, handling care, and etiquette with performance tier badges.

#### 28. `/delivery-partner/route` — Live GPS Multi-Stop Navigation Map
- **File**: [`src/app/delivery-partner/route/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/route/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Map overview plotting optimal transit between customer homes and partner workshops.

#### 29. `/delivery-partner/schedule` — Delivery Shift & Slot Planner
- **File**: [`src/app/delivery-partner/schedule/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/schedule/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Book working time slots and select preferred operating service zones.

#### 30. `/delivery-partner/settings` — Valet App Preferences
- **File**: [`src/app/delivery-partner/settings/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/settings/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Navigation app choice (Google Maps vs Waze), audio alert tones, and battery saver settings.

#### 31. `/delivery-partner/support` — Driver Roadside & Order Assistance
- **File**: [`src/app/delivery-partner/support/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/support/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Live dispatch hotline, customer unreachable reporting, and vehicle breakdown assistance.

#### 32. `/delivery-partner/support/requests/[ticketId]` — Driver Roadside & Order Assistance
- **File**: [`src/app/delivery-partner/support/requests/[ticketId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/support/requests/[ticketId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Live dispatch hotline, customer unreachable reporting, and vehicle breakdown assistance.

#### 33. `/delivery-partner/tasks` — Available & Assigned Logistics Jobs
- **File**: [`src/app/delivery-partner/tasks/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/tasks/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  List of customer doorstep pickups and workshop delivery drop-offs.

#### 34. `/delivery-partner/tasks/[taskId]` — Task Dispatch & Order Overview
- **File**: [`src/app/delivery-partner/tasks/[taskId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/delivery-partner/tasks/[taskId]/page.tsx)
- **Access Role**: `Authenticated (DELIVERY_PARTNER)`
- **Workflow & Responsibilities**:
  Job details, customer contact, item count estimate, and accept/reject action.

---

## ADMIN & OPERATIONS PORTAL (60 Routes)

| # | Route URL | File Path | Feature / Screen Name | Access Level | Detailed Purpose & Workflow |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `/admin/bookings` | `src/app/admin/bookings/page.tsx` | **bookings** | `Role-Based` | Application route supporting domain workflows. |
| 2 | `/admin/bookings/[bookingId]` | `src/app/admin/bookings/[bookingId]/page.tsx` | **bookingId** | `Role-Based` | Application route supporting domain workflows. |
| 3 | `/admin/communications/drafts` | `src/app/admin/communications/drafts/page.tsx` | **Broadcast Announcements & SMS/Email Campaigns** | `Authenticated (ADMIN)` | Send citywide service alerts, promotional push notifications, and partner maintenance announcements. |
| 4 | `/admin/communications/new` | `src/app/admin/communications/new/page.tsx` | **Broadcast Announcements & SMS/Email Campaigns** | `Authenticated (ADMIN)` | Send citywide service alerts, promotional push notifications, and partner maintenance announcements. |
| 5 | `/admin/communications` | `src/app/admin/communications/page.tsx` | **Broadcast Announcements & SMS/Email Campaigns** | `Authenticated (ADMIN)` | Send citywide service alerts, promotional push notifications, and partner maintenance announcements. |
| 6 | `/admin/communications/[communicationId]` | `src/app/admin/communications/[communicationId]/page.tsx` | **Broadcast Announcements & SMS/Email Campaigns** | `Authenticated (ADMIN)` | Send citywide service alerts, promotional push notifications, and partner maintenance announcements. |
| 7 | `/admin/customers` | `src/app/admin/customers/page.tsx` | **Customer Database & Accounts** | `Authenticated (ADMIN)` | Directory of registered customers, lifetime spend, order history, and account suspension tools. |
| 8 | `/admin/customers/[customerId]` | `src/app/admin/customers/[customerId]/page.tsx` | **Customer 360 Profile & Audit Trail** | `Authenticated (ADMIN)` | Comprehensive customer dossier with full order history, saved addresses, reward balance, and GDPR controls. |
| 9 | `/admin/delivery-partners` | `src/app/admin/delivery-partners/page.tsx` | **Valet Fleet Roster & Monitoring** | `Authenticated (ADMIN)` | Active driver roster, vehicle verification status, real-time GPS coordinates, and completion rates. |
| 10 | `/admin/delivery-partners/[partnerId]` | `src/app/admin/delivery-partners/[partnerId]/page.tsx` | **Delivery Partner Audit & Performance** | `Authenticated (ADMIN)` | Driver background checks, license documentation, earnings record, and customer feedback ledger. |
| 11 | `/admin/disputes` | `src/app/admin/disputes/page.tsx` | **Customer Grievances & Claim Resolution** | `Authenticated (ADMIN / SUPPORT)` | Triage queue for damaged items, lost garments, or late delivery claims with insurance tracking. |
| 12 | `/admin/disputes/[disputeId]` | `src/app/admin/disputes/[disputeId]/page.tsx` | **Dispute Investigation & Resolution Case** | `Authenticated (ADMIN / SUPPORT)` | Examine intake photos, compare with delivery proof, adjudicate liability, and issue customer refunds. |
| 13 | `/admin/login` | `src/app/admin/login/page.tsx` | **Admin & Operator Secure Sign-In** | `Public (Restricted Access)` | MFA-enforced admin authentication gateway with hardware token and audit logging. |
| 14 | `/admin/notifications` | `src/app/admin/notifications/page.tsx` | **notifications** | `Role-Based` | Application route supporting domain workflows. |
| 15 | `/admin/notifications/preferences` | `src/app/admin/notifications/preferences/page.tsx` | **preferences** | `Role-Based` | Application route supporting domain workflows. |
| 16 | `/admin/notifications/[notificationId]` | `src/app/admin/notifications/[notificationId]/page.tsx` | **notificationId** | `Role-Based` | Application route supporting domain workflows. |
| 17 | `/admin/onboarding` | `src/app/admin/onboarding/page.tsx` | **Partner KYC & Document Verification Queue** | `Authenticated (ADMIN)` | Compliance review queue for pending studio and driver applications. |
| 18 | `/admin/operations` | `src/app/admin/operations/page.tsx` | **Live Order Dispatch & Fleet Management** | `Authenticated (ADMIN / OPERATIONS)` | Real-time citywide operations grid tracking all active pickups, cleaning jobs, and deliveries. |
| 19 | `/admin/operations/[bookingId]` | `src/app/admin/operations/[bookingId]/page.tsx` | **Admin Order Intervention & Override** | `Authenticated (ADMIN / OPERATIONS)` | Force status transition, reassign delivery partner, or reroute order to another workshop. |
| 20 | `/admin/organization` | `src/app/admin/organization/page.tsx` | **Multi-Tenant Organization Management** | `Authenticated (SUPER_ADMIN)` | Cross-tenant organization configuration, regional franchise boundaries, and tenant isolation controls. |
| 21 | `/admin` | `src/app/admin/page.tsx` | **Master Control & Operations Command Center** | `Authenticated (ADMIN / OPERATIONS)` | Platform-wide live cockpit: active orders, system health, revenue ticker, SLA breaches, and fleet alerts. |
| 22 | `/admin/payments/bookings/[bookingId]` | `src/app/admin/payments/bookings/[bookingId]/page.tsx` | **Booking Payment & Refund Ledger** | `Authenticated (ADMIN / FINANCIAL)` | Detailed breakdown of payment, taxes, service fee, and refund audit history for an individual booking. |
| 23 | `/admin/payments/delivery-partners/[partnerId]` | `src/app/admin/payments/delivery-partners/[partnerId]/page.tsx` | **Driver Payout Ledger & Approval** | `Authenticated (ADMIN / FINANCIAL)` | Review driver trip fares, bonuses, tips, and batch disbursals. |
| 24 | `/admin/payments` | `src/app/admin/payments/page.tsx` | **Financial Ledger & Transaction Reconciliation** | `Authenticated (ADMIN / FINANCIAL)` | Double-entry balance verification, gateway fee reconciliation, and platform margin analytics. |
| 25 | `/admin/payments/providers/[providerId]` | `src/app/admin/payments/providers/[providerId]/page.tsx` | **Provider Settlement Run & Disbursal** | `Authenticated (ADMIN / FINANCIAL)` | Audit and approve automated payouts to workshop studio bank accounts. |
| 26 | `/admin/payments/transactions/[transactionId]` | `src/app/admin/payments/transactions/[transactionId]/page.tsx` | **Transaction Forensic Audit Record** | `Authenticated (ADMIN / FINANCIAL)` | Raw payment gateway payload, cryptographic signatures, bank response codes, and ledger journal entry. |
| 27 | `/admin/profile` | `src/app/admin/profile/page.tsx` | **profile** | `Role-Based` | Application route supporting domain workflows. |
| 28 | `/admin/providers` | `src/app/admin/providers/page.tsx` | **Provider Studio Partners Management** | `Authenticated (ADMIN)` | Management of certified workshop partners, capacity compliance, and quality rating audits. |
| 29 | `/admin/providers/[providerId]` | `src/app/admin/providers/[providerId]/page.tsx` | **Provider Partner Dossier & Audit** | `Authenticated (ADMIN)` | Workshop contract details, equipment inspections, fee split rules, and performance metrics. |
| 30 | `/admin/reports/bookings` | `src/app/admin/reports/bookings/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 31 | `/admin/reports/customers` | `src/app/admin/reports/customers/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 32 | `/admin/reports/data-quality` | `src/app/admin/reports/data-quality/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 33 | `/admin/reports/delivery-partners` | `src/app/admin/reports/delivery-partners/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 34 | `/admin/reports/experiments` | `src/app/admin/reports/experiments/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 35 | `/admin/reports/funnel` | `src/app/admin/reports/funnel/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 36 | `/admin/reports/improvements` | `src/app/admin/reports/improvements/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 37 | `/admin/reports/operations` | `src/app/admin/reports/operations/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 38 | `/admin/reports` | `src/app/admin/reports/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 39 | `/admin/reports/providers` | `src/app/admin/reports/providers/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 40 | `/admin/reports/revenue` | `src/app/admin/reports/revenue/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 41 | `/admin/reports/reviews` | `src/app/admin/reports/reviews/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 42 | `/admin/reports/services` | `src/app/admin/reports/services/page.tsx` | **BI & Analytical Reporting Engine** | `Authenticated (ADMIN / ANALYTICS)` | Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency. |
| 43 | `/admin/reviews` | `src/app/admin/reviews/page.tsx` | **Platform Reviews Moderation & Quality Control** | `Authenticated (ADMIN)` | Audit customer reviews, flag inappropriate content, and monitor partner quality scores. |
| 44 | `/admin/reviews/[reviewId]` | `src/app/admin/reviews/[reviewId]/page.tsx` | **Platform Reviews Moderation & Quality Control** | `Authenticated (ADMIN)` | Audit customer reviews, flag inappropriate content, and monitor partner quality scores. |
| 45 | `/admin/services/new` | `src/app/admin/services/new/page.tsx` | **Create Global Service Treatment** | `Authenticated (ADMIN)` | Define new platform-wide laundry or restoration treatment with default pricing rules. |
| 46 | `/admin/services` | `src/app/admin/services/page.tsx` | **Master Services Catalog Manager** | `Authenticated (ADMIN)` | Configure universal categories (Clothing, Shoe, Car, Bag, Helmet), base prices, and master SLAs. |
| 47 | `/admin/services/[serviceId]/edit` | `src/app/admin/services/[serviceId]/edit/page.tsx` | **Edit Global Service Parameters** | `Authenticated (ADMIN)` | Modify description, image assets, default addons, and standard turnaround hours. |
| 48 | `/admin/services/[serviceId]` | `src/app/admin/services/[serviceId]/page.tsx` | **Global Service Analytics & Details** | `Authenticated (ADMIN)` | Performance metrics for a specific service category across all cities and partner workshops. |
| 49 | `/admin/settings/account` | `src/app/admin/settings/account/page.tsx` | **Platform Governance & RBAC Security Settings** | `Authenticated (SUPER_ADMIN)` | Manage admin roles, API keys, webhook integrations, audit logs, and security policies. |
| 50 | `/admin/settings/members` | `src/app/admin/settings/members/page.tsx` | **Platform Governance & RBAC Security Settings** | `Authenticated (SUPER_ADMIN)` | Manage admin roles, API keys, webhook integrations, audit logs, and security policies. |
| 51 | `/admin/settings/notifications` | `src/app/admin/settings/notifications/page.tsx` | **Platform Governance & RBAC Security Settings** | `Authenticated (SUPER_ADMIN)` | Manage admin roles, API keys, webhook integrations, audit logs, and security policies. |
| 52 | `/admin/settings/organization` | `src/app/admin/settings/organization/page.tsx` | **Platform Governance & RBAC Security Settings** | `Authenticated (SUPER_ADMIN)` | Manage admin roles, API keys, webhook integrations, audit logs, and security policies. |
| 53 | `/admin/settings` | `src/app/admin/settings/page.tsx` | **Platform Governance & RBAC Security Settings** | `Authenticated (SUPER_ADMIN)` | Manage admin roles, API keys, webhook integrations, audit logs, and security policies. |
| 54 | `/admin/settings/preferences` | `src/app/admin/settings/preferences/page.tsx` | **Platform Governance & RBAC Security Settings** | `Authenticated (SUPER_ADMIN)` | Manage admin roles, API keys, webhook integrations, audit logs, and security policies. |
| 55 | `/admin/settings/roles` | `src/app/admin/settings/roles/page.tsx` | **Platform Governance & RBAC Security Settings** | `Authenticated (SUPER_ADMIN)` | Manage admin roles, API keys, webhook integrations, audit logs, and security policies. |
| 56 | `/admin/settings/security` | `src/app/admin/settings/security/page.tsx` | **Platform Governance & RBAC Security Settings** | `Authenticated (SUPER_ADMIN)` | Manage admin roles, API keys, webhook integrations, audit logs, and security policies. |
| 57 | `/admin/support/new` | `src/app/admin/support/new/page.tsx` | **Create Internal Operations Ticket** | `Authenticated (ADMIN / SUPPORT)` | Log manual complaint or escalations on behalf of customer or partner. |
| 58 | `/admin/support` | `src/app/admin/support/page.tsx` | **Omnichannel Customer & Partner Helpdesk** | `Authenticated (ADMIN / SUPPORT)` | Unified ticketing queue handling queries from customers, providers, and drivers. |
| 59 | `/admin/support/[ticketId]` | `src/app/admin/support/[ticketId]/page.tsx` | **Support Ticket Thread & Resolution** | `Authenticated (ADMIN / SUPPORT)` | Direct customer communication, internal agent notes, and ticket resolution actions. |
| 60 | `/admin/unauthorized` | `src/app/admin/unauthorized/page.tsx` | **Access Denied & RBAC Violation Notice** | `Authenticated` | Security splash displayed when user attempts to access routes beyond their role permissions. |

### In-Depth Domain Breakdown — Admin & Operations

#### 1. `/admin/bookings` — bookings
- **File**: [`src/app/admin/bookings/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/bookings/page.tsx)
- **Access Role**: `Role-Based`
- **Workflow & Responsibilities**:
  Application route supporting domain workflows.

#### 2. `/admin/bookings/[bookingId]` — bookingId
- **File**: [`src/app/admin/bookings/[bookingId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/bookings/[bookingId]/page.tsx)
- **Access Role**: `Role-Based`
- **Workflow & Responsibilities**:
  Application route supporting domain workflows.

#### 3. `/admin/communications/drafts` — Broadcast Announcements & SMS/Email Campaigns
- **File**: [`src/app/admin/communications/drafts/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/communications/drafts/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Send citywide service alerts, promotional push notifications, and partner maintenance announcements.

#### 4. `/admin/communications/new` — Broadcast Announcements & SMS/Email Campaigns
- **File**: [`src/app/admin/communications/new/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/communications/new/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Send citywide service alerts, promotional push notifications, and partner maintenance announcements.

#### 5. `/admin/communications` — Broadcast Announcements & SMS/Email Campaigns
- **File**: [`src/app/admin/communications/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/communications/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Send citywide service alerts, promotional push notifications, and partner maintenance announcements.

#### 6. `/admin/communications/[communicationId]` — Broadcast Announcements & SMS/Email Campaigns
- **File**: [`src/app/admin/communications/[communicationId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/communications/[communicationId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Send citywide service alerts, promotional push notifications, and partner maintenance announcements.

#### 7. `/admin/customers` — Customer Database & Accounts
- **File**: [`src/app/admin/customers/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/customers/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Directory of registered customers, lifetime spend, order history, and account suspension tools.

#### 8. `/admin/customers/[customerId]` — Customer 360 Profile & Audit Trail
- **File**: [`src/app/admin/customers/[customerId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/customers/[customerId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Comprehensive customer dossier with full order history, saved addresses, reward balance, and GDPR controls.

#### 9. `/admin/delivery-partners` — Valet Fleet Roster & Monitoring
- **File**: [`src/app/admin/delivery-partners/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/delivery-partners/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Active driver roster, vehicle verification status, real-time GPS coordinates, and completion rates.

#### 10. `/admin/delivery-partners/[partnerId]` — Delivery Partner Audit & Performance
- **File**: [`src/app/admin/delivery-partners/[partnerId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/delivery-partners/[partnerId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Driver background checks, license documentation, earnings record, and customer feedback ledger.

#### 11. `/admin/disputes` — Customer Grievances & Claim Resolution
- **File**: [`src/app/admin/disputes/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/disputes/page.tsx)
- **Access Role**: `Authenticated (ADMIN / SUPPORT)`
- **Workflow & Responsibilities**:
  Triage queue for damaged items, lost garments, or late delivery claims with insurance tracking.

#### 12. `/admin/disputes/[disputeId]` — Dispute Investigation & Resolution Case
- **File**: [`src/app/admin/disputes/[disputeId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/disputes/[disputeId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN / SUPPORT)`
- **Workflow & Responsibilities**:
  Examine intake photos, compare with delivery proof, adjudicate liability, and issue customer refunds.

#### 13. `/admin/login` — Admin & Operator Secure Sign-In
- **File**: [`src/app/admin/login/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/login/page.tsx)
- **Access Role**: `Public (Restricted Access)`
- **Workflow & Responsibilities**:
  MFA-enforced admin authentication gateway with hardware token and audit logging.

#### 14. `/admin/notifications` — notifications
- **File**: [`src/app/admin/notifications/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/notifications/page.tsx)
- **Access Role**: `Role-Based`
- **Workflow & Responsibilities**:
  Application route supporting domain workflows.

#### 15. `/admin/notifications/preferences` — preferences
- **File**: [`src/app/admin/notifications/preferences/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/notifications/preferences/page.tsx)
- **Access Role**: `Role-Based`
- **Workflow & Responsibilities**:
  Application route supporting domain workflows.

#### 16. `/admin/notifications/[notificationId]` — notificationId
- **File**: [`src/app/admin/notifications/[notificationId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/notifications/[notificationId]/page.tsx)
- **Access Role**: `Role-Based`
- **Workflow & Responsibilities**:
  Application route supporting domain workflows.

#### 17. `/admin/onboarding` — Partner KYC & Document Verification Queue
- **File**: [`src/app/admin/onboarding/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/onboarding/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Compliance review queue for pending studio and driver applications.

#### 18. `/admin/operations` — Live Order Dispatch & Fleet Management
- **File**: [`src/app/admin/operations/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/operations/page.tsx)
- **Access Role**: `Authenticated (ADMIN / OPERATIONS)`
- **Workflow & Responsibilities**:
  Real-time citywide operations grid tracking all active pickups, cleaning jobs, and deliveries.

#### 19. `/admin/operations/[bookingId]` — Admin Order Intervention & Override
- **File**: [`src/app/admin/operations/[bookingId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/operations/[bookingId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN / OPERATIONS)`
- **Workflow & Responsibilities**:
  Force status transition, reassign delivery partner, or reroute order to another workshop.

#### 20. `/admin/organization` — Multi-Tenant Organization Management
- **File**: [`src/app/admin/organization/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/organization/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Cross-tenant organization configuration, regional franchise boundaries, and tenant isolation controls.

#### 21. `/admin` — Master Control & Operations Command Center
- **File**: [`src/app/admin/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/page.tsx)
- **Access Role**: `Authenticated (ADMIN / OPERATIONS)`
- **Workflow & Responsibilities**:
  Platform-wide live cockpit: active orders, system health, revenue ticker, SLA breaches, and fleet alerts.

#### 22. `/admin/payments/bookings/[bookingId]` — Booking Payment & Refund Ledger
- **File**: [`src/app/admin/payments/bookings/[bookingId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/payments/bookings/[bookingId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN / FINANCIAL)`
- **Workflow & Responsibilities**:
  Detailed breakdown of payment, taxes, service fee, and refund audit history for an individual booking.

#### 23. `/admin/payments/delivery-partners/[partnerId]` — Driver Payout Ledger & Approval
- **File**: [`src/app/admin/payments/delivery-partners/[partnerId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/payments/delivery-partners/[partnerId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN / FINANCIAL)`
- **Workflow & Responsibilities**:
  Review driver trip fares, bonuses, tips, and batch disbursals.

#### 24. `/admin/payments` — Financial Ledger & Transaction Reconciliation
- **File**: [`src/app/admin/payments/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/payments/page.tsx)
- **Access Role**: `Authenticated (ADMIN / FINANCIAL)`
- **Workflow & Responsibilities**:
  Double-entry balance verification, gateway fee reconciliation, and platform margin analytics.

#### 25. `/admin/payments/providers/[providerId]` — Provider Settlement Run & Disbursal
- **File**: [`src/app/admin/payments/providers/[providerId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/payments/providers/[providerId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN / FINANCIAL)`
- **Workflow & Responsibilities**:
  Audit and approve automated payouts to workshop studio bank accounts.

#### 26. `/admin/payments/transactions/[transactionId]` — Transaction Forensic Audit Record
- **File**: [`src/app/admin/payments/transactions/[transactionId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/payments/transactions/[transactionId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN / FINANCIAL)`
- **Workflow & Responsibilities**:
  Raw payment gateway payload, cryptographic signatures, bank response codes, and ledger journal entry.

#### 27. `/admin/profile` — profile
- **File**: [`src/app/admin/profile/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/profile/page.tsx)
- **Access Role**: `Role-Based`
- **Workflow & Responsibilities**:
  Application route supporting domain workflows.

#### 28. `/admin/providers` — Provider Studio Partners Management
- **File**: [`src/app/admin/providers/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/providers/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Management of certified workshop partners, capacity compliance, and quality rating audits.

#### 29. `/admin/providers/[providerId]` — Provider Partner Dossier & Audit
- **File**: [`src/app/admin/providers/[providerId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/providers/[providerId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Workshop contract details, equipment inspections, fee split rules, and performance metrics.

#### 30. `/admin/reports/bookings` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/bookings/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/bookings/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 31. `/admin/reports/customers` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/customers/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/customers/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 32. `/admin/reports/data-quality` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/data-quality/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/data-quality/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 33. `/admin/reports/delivery-partners` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/delivery-partners/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/delivery-partners/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 34. `/admin/reports/experiments` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/experiments/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/experiments/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 35. `/admin/reports/funnel` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/funnel/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/funnel/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 36. `/admin/reports/improvements` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/improvements/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/improvements/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 37. `/admin/reports/operations` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/operations/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/operations/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 38. `/admin/reports` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 39. `/admin/reports/providers` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/providers/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/providers/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 40. `/admin/reports/revenue` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/revenue/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/revenue/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 41. `/admin/reports/reviews` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/reviews/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/reviews/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 42. `/admin/reports/services` — BI & Analytical Reporting Engine
- **File**: [`src/app/admin/reports/services/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reports/services/page.tsx)
- **Access Role**: `Authenticated (ADMIN / ANALYTICS)`
- **Workflow & Responsibilities**:
  Deep analytics covering revenue, booking funnels, customer retention, provider SLA, and fleet efficiency.

#### 43. `/admin/reviews` — Platform Reviews Moderation & Quality Control
- **File**: [`src/app/admin/reviews/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reviews/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Audit customer reviews, flag inappropriate content, and monitor partner quality scores.

#### 44. `/admin/reviews/[reviewId]` — Platform Reviews Moderation & Quality Control
- **File**: [`src/app/admin/reviews/[reviewId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/reviews/[reviewId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Audit customer reviews, flag inappropriate content, and monitor partner quality scores.

#### 45. `/admin/services/new` — Create Global Service Treatment
- **File**: [`src/app/admin/services/new/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/services/new/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Define new platform-wide laundry or restoration treatment with default pricing rules.

#### 46. `/admin/services` — Master Services Catalog Manager
- **File**: [`src/app/admin/services/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/services/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Configure universal categories (Clothing, Shoe, Car, Bag, Helmet), base prices, and master SLAs.

#### 47. `/admin/services/[serviceId]/edit` — Edit Global Service Parameters
- **File**: [`src/app/admin/services/[serviceId]/edit/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/services/[serviceId]/edit/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Modify description, image assets, default addons, and standard turnaround hours.

#### 48. `/admin/services/[serviceId]` — Global Service Analytics & Details
- **File**: [`src/app/admin/services/[serviceId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/services/[serviceId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN)`
- **Workflow & Responsibilities**:
  Performance metrics for a specific service category across all cities and partner workshops.

#### 49. `/admin/settings/account` — Platform Governance & RBAC Security Settings
- **File**: [`src/app/admin/settings/account/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/settings/account/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Manage admin roles, API keys, webhook integrations, audit logs, and security policies.

#### 50. `/admin/settings/members` — Platform Governance & RBAC Security Settings
- **File**: [`src/app/admin/settings/members/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/settings/members/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Manage admin roles, API keys, webhook integrations, audit logs, and security policies.

#### 51. `/admin/settings/notifications` — Platform Governance & RBAC Security Settings
- **File**: [`src/app/admin/settings/notifications/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/settings/notifications/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Manage admin roles, API keys, webhook integrations, audit logs, and security policies.

#### 52. `/admin/settings/organization` — Platform Governance & RBAC Security Settings
- **File**: [`src/app/admin/settings/organization/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/settings/organization/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Manage admin roles, API keys, webhook integrations, audit logs, and security policies.

#### 53. `/admin/settings` — Platform Governance & RBAC Security Settings
- **File**: [`src/app/admin/settings/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/settings/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Manage admin roles, API keys, webhook integrations, audit logs, and security policies.

#### 54. `/admin/settings/preferences` — Platform Governance & RBAC Security Settings
- **File**: [`src/app/admin/settings/preferences/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/settings/preferences/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Manage admin roles, API keys, webhook integrations, audit logs, and security policies.

#### 55. `/admin/settings/roles` — Platform Governance & RBAC Security Settings
- **File**: [`src/app/admin/settings/roles/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/settings/roles/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Manage admin roles, API keys, webhook integrations, audit logs, and security policies.

#### 56. `/admin/settings/security` — Platform Governance & RBAC Security Settings
- **File**: [`src/app/admin/settings/security/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/settings/security/page.tsx)
- **Access Role**: `Authenticated (SUPER_ADMIN)`
- **Workflow & Responsibilities**:
  Manage admin roles, API keys, webhook integrations, audit logs, and security policies.

#### 57. `/admin/support/new` — Create Internal Operations Ticket
- **File**: [`src/app/admin/support/new/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/support/new/page.tsx)
- **Access Role**: `Authenticated (ADMIN / SUPPORT)`
- **Workflow & Responsibilities**:
  Log manual complaint or escalations on behalf of customer or partner.

#### 58. `/admin/support` — Omnichannel Customer & Partner Helpdesk
- **File**: [`src/app/admin/support/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/support/page.tsx)
- **Access Role**: `Authenticated (ADMIN / SUPPORT)`
- **Workflow & Responsibilities**:
  Unified ticketing queue handling queries from customers, providers, and drivers.

#### 59. `/admin/support/[ticketId]` — Support Ticket Thread & Resolution
- **File**: [`src/app/admin/support/[ticketId]/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/support/[ticketId]/page.tsx)
- **Access Role**: `Authenticated (ADMIN / SUPPORT)`
- **Workflow & Responsibilities**:
  Direct customer communication, internal agent notes, and ticket resolution actions.

#### 60. `/admin/unauthorized` — Access Denied & RBAC Violation Notice
- **File**: [`src/app/admin/unauthorized/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/admin/unauthorized/page.tsx)
- **Access Role**: `Authenticated`
- **Workflow & Responsibilities**:
  Security splash displayed when user attempts to access routes beyond their role permissions.

---

## GENERAL / ROOT PORTAL (1 Routes)

| # | Route URL | File Path | Feature / Screen Name | Access Level | Detailed Purpose & Workflow |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `/` | `src/app/page.tsx` | **Platform Root Gateway** | `Public` | Main landing page or gateway redirecting consumers to /customer discovery experience. |

### In-Depth Domain Breakdown — General / Root

#### 1. `/` — Platform Root Gateway
- **File**: [`src/app/page.tsx`](file:///d:/portfolio%20pages/laundry/src/app/page.tsx)
- **Access Role**: `Public`
- **Workflow & Responsibilities**:
  Main landing page or gateway redirecting consumers to /customer discovery experience.

---

