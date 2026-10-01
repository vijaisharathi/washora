---
name: Lumina Dark Tech
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#39393a'
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
  secondary: '#c8c6c8'
  on-secondary: '#303032'
  secondary-container: '#49494b'
  on-secondary-container: '#b9b8ba'
  tertiary: '#c8c6c8'
  on-tertiary: '#303032'
  tertiary-container: '#646365'
  on-tertiary-container: '#e3e0e2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#efdbff'
  primary-fixed-dim: '#dcb8ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6700b5'
  secondary-fixed: '#e4e2e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1b1b1d'
  on-secondary-fixed-variant: '#474648'
  tertiary-fixed: '#e4e2e4'
  tertiary-fixed-dim: '#c8c6c8'
  on-tertiary-fixed: '#1b1b1d'
  on-tertiary-fixed-variant: '#474648'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
  success-green: '#81C784'
  success-bg: '#1A3D24'
  error-red: '#ffb4ab'
  electric-violet: '#8a2be2'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  h1:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  h3:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  mono-display:
    fontFamily: monospace
    fontSize: 18px
    fontWeight: '700'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
---

## Brand & Style

Lumina embodies a **Corporate Modern** aesthetic tailored for high-performance developer tools and SaaS platforms. The brand personality is precise, technical, and focused, utilizing a deep "midnight" palette to reduce eye strain during long sessions of data management and campaign optimization. 

The visual style leverages **low-contrast outlines** and **tonal layering** rather than aggressive shadows to define hierarchy. It feels "engineered" rather than "decorated," favoring functional clarity and typographic precision. The use of vibrant electric violet as a primary accent injects a sense of energy into an otherwise sober, utilitarian workspace.

## Colors

The color system is built on a "Surface-Container" architecture. The background uses a deep neutral (`#131314`), while interactive components and cards are lifted using progressively lighter shades of gray (`surface-container-low` to `highest`).

- **Primary:** Electric Violet (`#8a2be2`) is used exclusively for primary actions, active navigation states, and progress indicators.
- **Surface Tones:** A strict hierarchy of dark grays provides structural depth without relying on heavy shadows.
- **Semantic Colors:** Success states utilize a high-contrast forest green background with mint text for maximum legibility in dark mode. Error states use a muted red container with high-saturation red text for urgency without visual fatigue.

## Typography

The system exclusively uses **Geist**, a typeface designed for developers and data-heavy interfaces. It provides exceptional legibility at small sizes and a clean, technical feel at display sizes.

- **Headlines:** Use tighter letter-spacing and heavier weights (600-700) to create a strong visual anchor.
- **Labels:** Set in 500 weight with slight tracking to distinguish them from body copy.
- **Data/Codes:** Coupon codes and technical identifiers should use a monospaced stack or Geist with increased letter spacing for clarity.
- **Hierarchy:** Maintain a clear contrast between `h1` page titles and `h3` section headers within cards.

## Layout & Spacing

Lumina uses a **fixed-fluid hybrid** model. The main navigation is a fixed left-hand rail (256px), while the main content area occupies a fluid space with a maximum container width of 1200px to ensure line lengths remain readable.

- **Grid:** A 12-column grid is used for desktop, reflowing to 1 column on mobile.
- **Margins:** Standard page padding is `xl` (32px).
- **Rhythm:** An 8px base unit drives all spacing. Elements within cards use `md` (16px) or `lg` (24px) padding depending on complexity. 
- **Breaks:** Use `border-outline-variant/30` dividers to separate logical groups within a single vertical flow.

## Elevation & Depth

Depth is achieved through **chromatic layering** and **subtle borders** rather than shadows.

- **Level 0 (Background):** Base color `#131314`.
- **Level 1 (Sidebars/Headers):** `surface-container-low` with a 30% opacity border.
- **Level 2 (Cards):** `surface-container` with a 20% opacity border (`outline-variant`).
- **Overlays:** Top navigation uses an 80% opacity blur (`backdrop-blur-md`) to maintain context while scrolling.
- **Shadows:** Reserved strictly for primary action buttons (e.g., `shadow-lg shadow-primary/20`) to create a "glow" effect that signifies interactivity.

## Shapes

The shape language is **Rounded**, balancing the technical nature of the font with approachable UI elements. 

- **Containers:** Standard cards and input fields use `0.5rem` (rounded-lg).
- **Navigation:** Active states within sidebars use `0.5rem` to create a soft, integrated feel.
- **Status Badges:** Use `full` (pill) rounding to distinguish status indicators from clickable buttons.
- **Buttons:** Match container rounding (`0.5rem`) for a cohesive "block" look.

## Components

### Buttons
- **Primary:** Solid Electric Violet background, white text, bold weight. Includes a subtle primary-tinted shadow.
- **Secondary/Ghost:** Bordered with `outline-variant`, transparent background, transition to `surface-container` on hover.

### Input Fields
- **Standard:** Background `surface-container-low`, border `outline-variant/50`. On focus, border changes to `primary` with a 1px ring.
- **Search:** Includes a leading icon in `on-surface-variant` color.

### Navigation
- **Sidebar Rails:** Icons use 24px Material Symbols. Active state uses a 10% primary opacity background and bold text.
- **Breadcrumbs:** Small `label-md` text with `chevron_right` separators.

### Cards & Bento Grid
- Card headers should use `h3` or `label-md` (bold) depending on content type. 
- Statistics within cards should utilize `headline-md` for the primary value and `caption` for the label to create high information density.

### Status Indicators
- **Active:** Pill shape, `#1A3D24` background, `#81C784` text, 10px uppercase bold tracking.
- **Warnings:** Soft red background (`error-container/10`) with a 30% opacity border for non-blocking alerts.