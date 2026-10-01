# Queryholic Frontend Engineering Skill

## Purpose

You are the senior frontend engineer responsible for converting the existing Queryholic Stitch-generated UI into a production-quality frontend application.

The source UI already exists. Your job is **implementation, architecture, fidelity, and engineering quality** — not visual redesign.

The application must be built with:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand only where true global client state is required
- Lucide icons unless the existing UI explicitly uses another icon source

---

# 1. NON-NEGOTIABLE PRODUCT RULE

The exported Stitch UI is the **visual source of truth**.

Do NOT:

- redesign the UI
- invent a new visual language
- replace the established color palette
- replace typography
- change spacing conventions
- change border-radius conventions
- change card styles
- change navigation patterns
- arbitrarily add gradients
- arbitrarily add glassmorphism
- add unnecessary animations
- replace existing imagery
- replace icons without a reason
- simplify complex screens merely to make implementation easier
- remove screens because they look repetitive

If the Stitch UI and your personal design preference conflict:

**Stitch UI wins.**

Before implementing a screen, inspect the existing UI and identify its visual patterns.

---

# 2. PRIMARY OBJECTIVE

Convert the exported Stitch project into a maintainable, scalable, responsive Next.js application while preserving visual fidelity.

The finished frontend must:

1. Reproduce the existing screens accurately.
2. Preserve all documented product flows.
3. Use reusable components instead of copy-pasted UI.
4. Have clean route architecture.
5. Have clear feature boundaries.
6. Support realistic mock data before backend integration.
7. Handle loading, empty, error, success and disabled states.
8. Be responsive.
9. Be accessible.
10. Be ready for API/backend integration.
11. Avoid technical shortcuts that create future migration work.

---

# 3. FIRST ACTION — AUDIT BEFORE CODING

Do NOT immediately start rewriting screens.

First inspect the entire exported project.

Audit:

- package.json
- existing framework
- existing source structure
- all HTML/TSX/JSX files
- CSS
- Tailwind configuration
- assets
- fonts
- icons
- images
- generated components
- routes
- repeated patterns
- responsive rules
- interactive elements
- forms
- tables
- cards
- dialogs
- drawers
- navigation
- tabs
- filters
- search
- pagination
- state variations

Create an internal inventory:

### Screen Inventory

For every screen identify:

- screen name
- route
- product role
- purpose
- primary CTA
- secondary actions
- components used
- data displayed
- user interactions
- loading state
- empty state
- error state
- success state
- responsive behavior
- dependencies

### Component Inventory

Identify:

- global components
- layout components
- navigation components
- form components
- marketplace components
- booking components
- provider components
- delivery components
- admin components

Do not duplicate a component merely because it appears on multiple screens.

---

# 4. PHASE MAPPING

The project contains these major product areas.

## Customer

The customer experience includes:

- authentication
- discovery
- categories
- services
- providers
- booking
- checkout
- payment UI
- order tracking
- order history
- reviews
- profile
- addresses
- favorites
- notifications
- support

## Provider

Provider experience includes:

- onboarding
- registration
- business profile
- KYC
- verification
- dashboard
- service catalog
- pricing
- availability
- working hours
- service areas
- capacity
- booking/order management
- processing
- workshop operations
- pickup/delivery handoff
- earnings
- transactions
- payouts
- settlements
- settings

## Admin / Operations

Includes:

- admin dashboard
- order management
- provider management
- customer management
- dispute/complaint management
- refund management
- payment management
- settlement management
- delivery/logistics monitoring
- KYC review
- analytics
- support operations
- audit activity

## Delivery Partner

Includes:

- onboarding
- verification
- dashboard
- available delivery jobs
- job details
- accept/reject
- pickup workflow
- pickup confirmation
- active delivery
- navigation UI
- delivery confirmation
- failed delivery
- reschedule
- delivery history
- earnings
- settings

## Marketing / Platform

Includes:

- landing
- service discovery
- lead capture
- provider lead forms
- business leads
- delivery partner leads
- contact
- company/platform content
- careers
- blog/content where present

---

# 5. ROUTE ARCHITECTURE

Use clear route namespaces.

Preferred structure:

```text
app/
├── (marketing)/
├── (auth)/
├── customer/
├── provider/
├── delivery/
└── admin/
```

Example:

```text
/auth/login
/auth/register

/customer
/customer/services
/customer/services/[slug]
/customer/providers/[id]
/customer/bookings
/customer/bookings/[id]
/customer/profile
/customer/addresses

/provider
/provider/onboarding
/provider/dashboard
/provider/services
/provider/orders
/provider/orders/[id]
/provider/operations
/provider/earnings
/provider/settings

/delivery
/delivery/dashboard
/delivery/jobs
/delivery/jobs/[id]
/delivery/history
/delivery/earnings

/admin
/admin/dashboard
/admin/orders
/admin/providers
/admin/customers
/admin/delivery
/admin/disputes
/admin/refunds
/admin/payments
/admin/settlements
/admin/kyc
/admin/analytics
```

Do not force these exact routes if the existing Stitch export has an established route structure. Preserve existing semantics where appropriate.

---

# 6. PROJECT ARCHITECTURE

Prefer a feature-oriented architecture.

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── customer/
│   ├── provider/
│   ├── delivery/
│   ├── admin/
│   ├── booking/
│   ├── orders/
│   ├── services/
│   ├── payments/
│   ├── support/
│   └── notifications/
│
├── hooks/
├── lib/
├── services/
│   └── api/
├── mocks/
├── types/
├── config/
└── assets/
```

Use the architecture as a guideline, not as an excuse to move working code unnecessarily.

---

# 7. SHADCN/UI RULES

shadcn/ui is the component foundation.

However:

**Do not allow shadcn defaults to overwrite the Queryholic design.**

Customize components to match the existing Stitch UI.

Shared components may include:

- Button
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Badge
- Avatar
- Card
- Dialog
- Sheet
- Dropdown
- Tabs
- Tooltip
- Popover
- Calendar
- Table
- Pagination
- Toast
- Alert
- Skeleton
- Form

Create variants when the same component appears in different visual states.

Example:

```text
Button
├── primary
├── secondary
├── outline
├── ghost
├── destructive
└── loading
```

Do not create one-off CSS implementations when an existing shared component can support the requirement.

---

# 8. DESIGN TOKEN EXTRACTION

Before implementing large numbers of screens, identify the established visual tokens.

Document and centralize:

- primary color
- secondary colors
- background colors
- surface colors
- text colors
- muted text
- border colors
- typography
- font weights
- spacing scale
- border radius
- shadows
- breakpoints
- component heights
- icon sizes

Use CSS variables/Tailwind tokens where appropriate.

Do not scatter arbitrary values throughout the codebase.

If a value comes directly from the Stitch UI, preserve it.

---

# 9. COMPONENT REUSE RULE

Use this hierarchy:

```text
Design Tokens
    ↓
Primitive UI
    ↓
Shared Components
    ↓
Feature Components
    ↓
Screens
```

Example:

```text
Button
  ↓
PrimaryAction
  ↓
AcceptOrderButton
  ↓
ProviderOrderScreen
```

Do not build:

```text
Screen A → custom button
Screen B → another custom button
Screen C → another custom button
```

when all three use the same visual pattern.

---

# 10. MOCK DATA FIRST

Until backend APIs exist, use a structured mock layer.

Create realistic entities:

```text
User
Customer
Provider
DeliveryPartner
ServiceCategory
Service
ServiceVariant
Booking
BookingItem
Order
ServiceJob
DeliveryJob
Payment
Refund
Review
Notification
SupportTicket
Dispute
Settlement
Earning
```

Mock data must reflect realistic relationships.

Bad:

```text
name: "Test"
price: 123
status: "x"
```

Good:

```text
provider
→ services
→ booking
→ order
→ processing
→ delivery
→ payment
```

The frontend should behave as if real backend data exists.

Do not hardcode data directly inside large page components.

---

# 11. DATA LAYER

Separate UI from data access.

Preferred direction:

```text
Screen
 ↓
Feature hook
 ↓
Query / mutation
 ↓
Service layer
 ↓
Mock API OR real API
```

For example:

```text
useBookings()
useBooking(id)
useAcceptOrder()
useProviderServices()
useDeliveryJobs()
```

Initially these may use mock implementations.

Later replace the underlying service with real API calls without rewriting the screen.

---

# 12. STATE MANAGEMENT

Use the smallest appropriate state scope.

Prefer:

- local React state for local UI state
- URL state for filters/search/pagination when appropriate
- TanStack Query for server state
- Zustand only for genuinely shared client state

Do not put every piece of state into Zustand.

Examples of suitable global client state:

- authenticated session shell
- booking/cart state when cross-route persistence is required
- global UI preferences

Server data should not be duplicated unnecessarily into global client state.

---

# 13. FORMS

Use:

```text
React Hook Form
+
Zod
```

for complex forms.

Important forms include:

- login
- registration
- provider onboarding
- KYC
- business profile
- service creation
- pricing
- availability
- address
- booking
- support
- dispute
- refund
- delivery confirmation
- lead capture

Validation must exist at the frontend level.

Never rely only on visual validation.

---

# 14. EVERY SCREEN MUST HANDLE STATES

Every data-dependent screen must consider:

### Loading

Use a skeleton matching the UI layout.

### Empty

Explain why no data exists and provide the relevant action.

### Error

Show a useful message and retry/recovery action.

### Success

Give clear confirmation.

### Disabled

Visually communicate unavailable actions.

### Pending

Clearly distinguish pending from completed.

### Rejected

Show reason and recovery path where appropriate.

### Network failure

Provide graceful retry behavior.

Do not leave blank screens.

---

# 15. INTERACTION IMPLEMENTATION

Every visible interactive element should have intentional behavior.

Audit:

- buttons
- links
- dropdowns
- tabs
- filters
- search
- pagination
- modals
- drawers
- forms
- upload controls
- status actions
- navigation
- breadcrumbs
- cards
- table rows

Do not leave fake buttons that appear clickable but do nothing unless they are explicitly marked as future functionality.

If backend functionality does not yet exist, implement a meaningful mock interaction.

---

# 16. CUSTOMER FLOW

The customer frontend should support a coherent journey:

```text
Discovery
 ↓
Category
 ↓
Service
 ↓
Provider
 ↓
Booking
 ↓
Address
 ↓
Price Review
 ↓
Checkout
 ↓
Payment UI
 ↓
Booking Confirmation
 ↓
Order Tracking
 ↓
Processing
 ↓
Delivery
 ↓
Completion
 ↓
Review
```

The UI must maintain consistent booking/order context throughout the journey.

---

# 17. PROVIDER FLOW

Provider journey:

```text
Registration
 ↓
Onboarding
 ↓
Business Profile
 ↓
KYC
 ↓
Verification
 ↓
Dashboard
 ↓
Service Catalog
 ↓
Pricing
 ↓
Availability
 ↓
Capacity
 ↓
Orders
 ↓
Processing
 ↓
Quality Check
 ↓
Handoff
 ↓
Earnings
 ↓
Settlement
```

Do not implement provider screens as disconnected dashboards.

The same mock booking/order entity should flow through the lifecycle.

---

# 18. DELIVERY FLOW

Delivery journey:

```text
Available Jobs
 ↓
Job Details
 ↓
Accept
 ↓
Pickup
 ↓
Pickup Confirmation
 ↓
Active Delivery
 ↓
Navigation
 ↓
Customer Handoff
 ↓
Proof
 ↓
Delivered
 ↓
Earnings
```

Support failed delivery and rescheduling states.

---

# 19. ADMIN FLOW

Admin/Ops must feel like an operational system rather than a marketing dashboard.

Prioritize:

- dense but readable data presentation
- filters
- search
- pagination
- status indicators
- timelines
- activity logs
- bulk actions where the UI specifies them
- confirmation dialogs for destructive actions
- audit visibility
- operational alerts

---

# 20. ACCESS CONTROL PREPARATION

Even before backend auth exists, structure routes/components around roles.

Roles:

```text
CUSTOMER
PROVIDER
DELIVERY_PARTNER
ADMIN
OPERATIONS
SUPPORT
```

Prepare a permission model.

Example:

```text
customer → customer routes
provider → provider routes
delivery_partner → delivery routes
admin → admin routes
operations → operational admin routes
support → support/admin support routes
```

Do not depend on hiding buttons alone for authorization.

Frontend checks improve UX; backend authorization will be authoritative later.

---

# 21. RESPONSIVE IMPLEMENTATION

Every screen must work at:

- desktop
- tablet
- mobile

Do not simply shrink desktop layouts.

Adapt:

- navigation
- columns
- tables
- cards
- forms
- dialogs
- spacing
- content priority

Maintain the same visual language across breakpoints.

For dense desktop tables, use an appropriate mobile representation rather than forcing unusable horizontal layouts unless the existing UI explicitly requires horizontal scrolling.

---

# 22. ACCESSIBILITY

Implement:

- semantic HTML
- labels
- keyboard navigation
- visible focus states
- appropriate ARIA only where needed
- accessible dialogs
- accessible form errors
- adequate touch targets
- meaningful alt text
- color-independent status communication

Accessibility improvements must not change the intended visual language.

---

# 23. PERFORMANCE

Avoid:

- unnecessary client components
- huge page-level bundles
- duplicate dependencies
- unnecessary re-renders
- unoptimized images
- repeated data fetching
- massive component files

Use Next.js server/client boundaries intentionally.

Use dynamic loading only when it provides a real benefit.

---

# 24. CODE QUALITY

Rules:

- TypeScript strictness should remain enabled where possible.
- Avoid `any`.
- Prefer explicit domain types.
- Keep components focused.
- Avoid huge monolithic page components.
- Extract repeated logic into hooks/services.
- Keep business logic out of presentation components where practical.
- Use clear naming.
- Avoid dead code.
- Avoid commented-out obsolete implementations.
- Avoid duplicated constants.
- Avoid magic strings where domain constants are appropriate.

---

# 25. FILE NAMING

Prefer consistent naming:

```text
PascalCase.tsx
camelCase.ts
kebab-case routes
```

Examples:

```text
OrderCard.tsx
BookingSummary.tsx
useBookings.ts
booking.service.ts
permissions.ts
```

---

# 26. ERROR HANDLING

Never expose:

- stack traces
- database errors
- internal service names
- secrets
- raw API errors

Convert technical errors into user-appropriate messages.

Provide retry actions where possible.

---

# 27. SECURITY RULES

Never place:

- API secrets
- private keys
- database credentials
- payment secrets
- signing secrets

inside client-side code.

Use environment variables.

Sensitive KYC/payment data should be treated as private.

Do not expose sensitive document URLs publicly.

---

# 28. IMPLEMENTATION ORDER

Follow this order.

## Stage A — Audit

1. Inspect exported Stitch project.
2. Identify framework and dependencies.
3. Inventory routes.
4. Inventory screens.
5. Inventory components.
6. Inventory assets.
7. Identify design tokens.
8. Identify repeated patterns.
9. Identify missing states.
10. Identify implementation gaps.

## Stage B — Foundation

1. Confirm Next.js setup.
2. Configure TypeScript.
3. Configure Tailwind.
4. Configure shadcn/ui.
5. Establish design tokens.
6. Establish fonts/assets.
7. Establish shared UI primitives.
8. Establish global layouts.

## Stage C — Routing

1. Auth routes.
2. Marketing routes.
3. Customer routes.
4. Provider routes.
5. Delivery routes.
6. Admin routes.
7. Route protection structure.

## Stage D — Shared Components

Build only after identifying actual repeated patterns.

## Stage E — Feature Implementation

Implement feature-by-feature using the existing Stitch screens.

Recommended order:

```text
Auth
 ↓
Customer foundation
 ↓
Customer booking
 ↓
Customer orders
 ↓
Provider foundation
 ↓
Provider services
 ↓
Provider orders/operations
 ↓
Provider earnings
 ↓
Delivery
 ↓
Admin/Ops
 ↓
Marketing
```

## Stage F — Mock Data

Connect every feature to realistic mock services.

## Stage G — Interaction

Make the full UI flows functional.

## Stage H — Responsive + Accessibility

Audit all screens.

## Stage I — QA

Run visual and functional QA.

## Stage J — Backend Integration

Only after the frontend contract is stable:

```text
Mock Service
      ↓
API Service
      ↓
Backend
```

The UI components should require minimal changes.

---

# 29. VISUAL QA PROCESS

For each implemented Stitch screen:

1. Open original Stitch reference.
2. Open implemented frontend screen.
3. Compare side-by-side.
4. Check:
   - layout
   - spacing
   - typography
   - colors
   - borders
   - radius
   - shadows
   - icons
   - images
   - component dimensions
   - alignment
   - responsive behavior
5. Fix discrepancies.
6. Repeat.

Do not declare a screen complete just because it renders.

---

# 30. DEFINITION OF DONE

A screen is DONE only when:

- route works
- layout matches Stitch
- responsive behavior works
- assets are correct
- typography is correct
- interactions work
- forms validate
- loading state exists where needed
- empty state exists where needed
- error state exists where needed
- success state exists where needed
- no console errors
- no TypeScript errors
- no broken links
- no obvious accessibility issues
- no duplicated component that should be shared
- mock data is realistic
- code is maintainable

---

# 31. DO NOT OVER-ENGINEER

Do not introduce technologies merely because they are popular.

Do not add:

- Redux unless justified
- unnecessary state libraries
- unnecessary animation libraries
- unnecessary UI libraries alongside shadcn
- microservices
- premature abstraction
- premature backend coupling

Prefer the simplest architecture that satisfies the actual product.

---

# 32. DO NOT STOP AT STATIC UI

The objective is not:

```text
"Make the pages look correct."
```

The objective is:

```text
"Make the complete frontend application behave correctly
using the existing UI as the source of truth."
```

A button should have a behavior.

A form should validate.

A filter should filter.

A search should search.

A tab should change content.

A booking should move through its mock lifecycle.

An order should have a status.

A delivery job should change state.

A provider action should affect the relevant mock data.

---

# 33. BACKEND-READY CONTRACT

Every feature should be designed so mock data can later be replaced by API calls.

Example:

```text
UI
 ↓
useBookings()
 ↓
bookingService.getBookings()
 ↓
Mock implementation today
API implementation later
```

Avoid:

```text
UI
 ↓
hardcoded arrays everywhere
```

---

# 34. GIT / DEVELOPMENT DISCIPLINE

Work in logical increments.

Recommended commits:

```text
chore: initialize frontend architecture
feat: implement shared design system
feat: implement auth flows
feat: implement customer marketplace
feat: implement booking flow
feat: implement customer orders
feat: implement provider dashboard
feat: implement provider operations
feat: implement delivery flows
feat: implement admin operations
fix: visual parity corrections
fix: responsive issues
```

Do not make one enormous untraceable change.

---

# 35. ANTIGRAVITY EXECUTION RULE

When working on the project:

### Before editing

Inspect.

### Before creating a component

Search for an existing reusable component.

### Before creating a style

Check the existing design tokens.

### Before creating a route

Check the route inventory.

### Before adding mock data

Check the domain types.

### Before changing UI

Verify whether the Stitch reference already defines the intended behavior.

### Before declaring completion

Run build/type/lint/visual checks available in the project.

---

# 36. PRIORITY SYSTEM

Use:

### P0 — Blocking

- build failure
- broken routing
- broken authentication flow
- unusable core booking/order flow
- data loss
- severe responsive breakage

### P1 — Important

- missing core interaction
- incorrect major layout
- missing important state
- broken role separation
- broken form validation

### P2 — Polish

- minor spacing
- typography differences
- minor alignment
- animation refinement

### P3 — Nice-to-have

- optional micro-interactions
- nonessential visual enhancements

Never spend P3 effort while P0/P1 issues remain.

---

# 37. FINAL RULE

The implementation must feel like one coherent Queryholic product.

Customer, Provider, Delivery Partner, Admin and Marketing are different product surfaces, but they must share the same underlying design language and engineering standards.

The final result should be:

**faithful to Stitch + scalable in Next.js + componentized with shadcn + type-safe + responsive + accessible + mock-data functional + backend-ready.**

Do not redesign.

Do not shortcut.

Do not randomly add features.

Do not randomly remove screens.

**Audit → Architect → Implement → Connect → Test → Integrate.**
