---
name: Lumina Admin
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#cfc2d7'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#988ca0'
  outline-variant: '#4c4354'
  surface-tint: '#dcb8ff'
  primary: '#dcb8ff'
  on-primary: '#480081'
  primary-container: '#8a2be2'
  on-primary-container: '#eed9ff'
  inverse-primary: '#8422dc'
  secondary: '#dcb8ff'
  on-secondary: '#3f225e'
  secondary-container: '#573976'
  on-secondary-container: '#caa7ec'
  tertiary: '#ffb873'
  on-tertiary: '#4b2800'
  tertiary-container: '#935400'
  on-tertiary-container: '#ffdaba'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#efdbff'
  primary-fixed-dim: '#dcb8ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6700b5'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#dcb8ff'
  on-secondary-fixed: '#290947'
  on-secondary-fixed-variant: '#573976'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
  success: '#4ade80'
  warning: '#fbbf24'
  critical: '#f87171'
  info: '#60a5fa'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 260px
  gutter: 16px
  margin-desktop: 24px
  margin-mobile: 16px
  table-cell-padding: 12px
---

## Brand & Style

The design system for this admin control center is an evolution of the Lumina aesthetic, shifting from consumer-facing luxury to professional operational precision. The brand personality is authoritative, technical, and high-density, designed for "Super Admins" who manage complex data flows at scale.

The visual style is a fusion of **Minimalism** and **Modern Enterprise**. It leverages the "True Dark" foundation of the original marketplace to reduce eye strain during long-term operational use. While it retains the high-end feel through quality typography and subtle depth, it prioritizes functional clarity over decorative glassmorphism. The interface is characterized by structured data grids, rigorous alignment, and a clear hierarchy that guides the user through dense information sets without cognitive overload.

## Colors

The palette is optimized for data density and operational status monitoring within a deep charcoal environment.

- **Foundational Neutrals:** The primary surface uses `#131314`. Navigation sidebars and headers use `#0e0e0f` to create a clear structural distinction from content areas.
- **Electric Violet (Primary):** Reserved for primary action buttons, active navigation states, and progress indicators. 
- **Semantic Logic:** Operations rely on a strict color-coded system:
    - **Success (Green):** System health and completed transactions.
    - **Warning (Amber):** Pending approvals or borderline latency.
    - **Critical (Red):** System errors, payment failures, or urgent alerts.
    - **Information (Blue):** General logs and neutral system updates.
- **Data Visualization:** Use the `secondary` violet and varied tonal grays to represent data series in charts, ensuring high contrast against the dark background.

## Typography

The design system exclusively uses **Geist** to maintain a technical, developer-centric aesthetic. The scale is tighter than the consumer version to accommodate more information on screen.

- **Monospaced Utility:** Use the monospaced features of Geist for tabular data, ID strings, and financial figures to ensure perfect vertical alignment.
- **Hierarchy:** Use `Headline-md` for card titles and table headers. `Body-md` is the standard for data entries.
- **Labels:** Use `Label-sm` for tags, badges, and micro-metadata. 
- **Readability:** Maintain a 1.4x to 1.5x line height for body text to ensure legibility against the dark background, which can otherwise cause "halation" effects for users.

## Layout & Spacing

This design system utilizes a **Fixed Sidebar + Fluid Content** model for maximum operational efficiency.

- **Sidebar Navigation:** A fixed 260px left-hand column contains the primary navigation. It should be collapsible to an 80px icon-only rail to maximize data workspace.
- **Grid System:** The content area follows a 12-column fluid grid. Use a condensed 16px gutter to increase information density.
- **Dashboard Structure:** Group related metrics into "Widget Containers." Use a consistent 24px gap between widgets.
- **Responsive Behavior:** 
  - **Desktop (>1280px):** Full sidebar and multi-column dashboard widgets.
  - **Tablet (768px - 1279px):** Collapsed sidebar and stacked widgets.
  - **Mobile (<767px):** Bottom navigation or hamburger menu; tables transform into cards.

## Elevation & Depth

Hierarchy is defined through **Tonal Tiering** and high-precision borders rather than soft shadows, maintaining a crisp, professional look.

- **Level 0 (Background):** `#0e0e0f` - The primary application shell.
- **Level 1 (Work Surface):** `#131314` - The main dashboard background.
- **Level 2 (Containers):** `#1c1b1c` - Cards, data tables, and modal backgrounds.
- **Level 3 (Interactive):** `#2a2a2b` - Hover states for rows and menu items.
- **Borders:** Use 1px borders of `#353436` for card outlines and table dividers. For active focus states, use a 1px solid Primary Violet border with a subtle 4px outer glow.

## Shapes

The shape language is "Soft" (4px - 8px), moving away from the large, playful curves of the marketplace to reflect a more serious, structured environment.

- **Component Radius:** Buttons, input fields, and checkboxes use a strict 4px (`rounded-sm`) radius for a precise, "engineered" appearance.
- **Container Radius:** Dashboard widgets and cards use an 8px (`rounded-lg`) radius.
- **Status Pills:** Status badges remain fully rounded (999px) to distinguish them from interactive buttons.

## Components

### Data Tables
- **Header:** Sticky headers with a secondary surface background (`#1c1b1c`). Use `Label-md` in uppercase for column titles.
- **Rows:** Alternating row stripes are not necessary; use a 1px bottom border. On hover, the entire row should transition to `#2a2a2b`.
- **Actions:** Inline icons for "View Details" or "Edit." Use a vertical ellipsis menu for secondary actions.

### Dashboard Widgets
- **KPI Cards:** Feature a large display number, a small trend sparkline (using semantic colors), and a `Label-sm` title.
- **Status Badges:** Compact pills. Success uses green text on a 10% opacity green background. Error/Critical uses red text on 10% opacity red.

### Side Navigation
- **Active State:** A vertical violet line (4px width) on the left edge of the active item, with the text transitioning to white.
- **Grouping:** Use `Label-sm` in a muted gray for category headers (e.g., "OPERATIONS", "USER MANAGEMENT").

### Input & Search
- **Search Bar:** Global search in the top header. Background `#1c1b1c` with a search icon prefix.
- **Forms:** Stacked labels above inputs. Inputs use the `surface-container` color with a subtle 1px border.

### Command Palette
- A central component triggered by `Cmd + K`, allowing Super Admins to quickly jump between vendors, users, or system logs without manual navigation.