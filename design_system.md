# ARROW Logistics — Design System

This document outlines the design tokens, layout variables, component specifications, and interaction principles that define the visual and interactive identity of the ARROW Logistics landing page.

---

## 1. Core Visual Principles

- **Premium Dark Aesthetic**: A deep navy/slate-black base is paired with translucent glassmorphic components to evoke high-tech efficiency.
- **Vibrant Accent Energy**: High-contrast, warm orange gradients guide user attention (CTAs, statistics, progress bars) and signify movement and delivery speed.
- **Cinematic Pinned Storytelling**: Multi-stage, scroll-scrubbed text transitions mapped directly to viewport video coordinates.

---

## 2. Color Palette (Design Tokens)

The following color tokens are defined inside `:root` in [`style.css`](file:///d:/Work%20Book/2026/Aug/25.09.26/html/style.css):

| Category | Token | CSS Variable Value | Sample / Use Case |
| :--- | :--- | :--- | :--- |
| **Accent Brands** | Primary Orange | `#F35325` | Icons, bullet points, tags, focus outlines |
| | Orange End | `#E63E11` | Hover end-states for gradients |
| | Orange Gradient | `linear-gradient(135deg, #F35325 0%, #E63E11 100%)` | Main CTAs, highlighted text headers |
| | Orange Glow | `rgba(243, 83, 37, 0.4)` | Subtle box-shadow glows behind CTAs |
| **Dark Theme** | Dark Base | `#0B1118` | Global page body background |
| | Dark Surface | `#121A24` | Solid cards background, select input states |
| | Surface Glass | `rgba(18, 26, 36, 0.7)` | Translucent telemetry card, scrolled headers |
| | Glass Border | `rgba(255, 255, 255, 0.12)` | Thin border outlines for card structures |
| **Light Neutrals**| White | `#ffffff` | Primary text headings, button text, badges |
| | Light Grey | `#F3F5F7` | Form inputs backgrounds |
| | Border Grey | `#E2E8F0` | Form segment boundaries, panel dividers |
| **Text Semantics**| Text Main | `#0B1118` | Dark text for inputs and white cards |
| | Text Light | `#F3F5F7` | Body text in dark layouts |
| | Text Muted | `#8A94A6` | Description text, unselected dropdown tabs |

---

## 3. Typography

Fonts are imported from Google Fonts (*Plus Jakarta Sans* and *Inter*) and styled using the following guidelines:

### Fonts Families
- **Heading Font**: `'Plus Jakarta Sans', sans-serif` — Used for main headlines, slide titles, sections, buttons, and badges.
- **Body Font**: `'Inter', sans-serif` — Used for paragraphs, forms, inputs, descriptions, and list elements.

### Headings Scale
- **Hero Slogan (`h1`)**: `3.5rem` (Large viewport), font-weight: `850`, line-height: `1.1`
- **Slide Title (`h2`)**: `3rem`, font-weight: `850`, line-height: `1.1`, shadow: `0 4px 30px rgba(0, 0, 0, 0.5)`
- **Section Title (`h2`)**: `2.5rem`, font-weight: `800`, letter-spacing: `-0.5px`
- **Card Slogan (`h3`)**: `1.25rem`, font-weight: `700`
- **Section Tagline**: `0.75rem`, font-weight: `800`, letter-spacing: `2px`, uppercase

---

## 4. Layout & Spacing Tokens

### Borders & Rounding (`border-radius`)
- **Capsules / Pills**: `9999px` (`--radius-pill`) — Used for buttons, navigation links, and tags.
- **Interactive Cards**: `20px` (`--radius-card`) — Used for tracking card and services blocks.
- **Small Components**: `10px` — Used for select elements, inputs, and download badges.

### Elevation & Shadows (`box-shadow`)
- **Deep Shadows**: `0 20px 40px -15px rgba(0, 0, 0, 0.3)` (`--shadow-deep`) — Used for absolute float panels.
- **Soft Shadows**: `0 10px 25px -5px rgba(0, 0, 0, 0.1)` (`--shadow-soft`) — Used for navigation bar scrolls.
- **Glow Accents**: `0 12px 24px -6px var(--orange-glow)` (`--shadow-glow`) — Combined with orange gradient CTAs.

---

## 5. UI Component Specifications

### 5.1 Buttons (`.btn`)
All buttons share a base capsule styling, a bold font weight, and transition animations:

- **Capsule Button (`.btn-white-capsule`)**: Used in navigation headers. Features white background, orange icon circle wrapper, and slides up `2px` on hover.
- **Gradient Button (`.btn-primary-gradient`)**: Used for the main hero CTA. Employs `var(--orange-gradient)` with a glass bullet symbol containing arrows.
- **Solid Form Button (`.btn-orange-solid`)**: Full width, handles tracking/calculator form submissions.

### 5.2 Cards
- **Tracking Card (`.tracking-card`)**: Solid white background, segmented navigation tabs with hover states, input containers with custom orange focus borders, and mobile app download badges.
- **Service Card (`.service-card`)**: Dark slate glass texture with a solid borders highlight. Elevates upwards by `8px` on hover, turning its icon orange circle background solid orange and text white.
- **Telemetry Card (`.glass-telemetry-card`)**: Translucent surface glass backdrop with a blinking live satellite dot, highlighting operational freight paths.

---

## 6. Interaction & Animation Rules

Animations are handled synchronously by GSAP and ScrollTrigger:

- **Pin Duration**: `+=4000` scroll units (scrub speed is configured at `1.2` seconds for smooth catch-up).
- **Interpolation Ease**: Video scrubbing utilizes `ease: 'none'` to maintain direct 1-to-1 linear alignment with the page scrollbar.
- **Transition Stages**:
  - **0% to 20%**: Hero Left column content fades out (`opacity: 0, y: -80`) and header fades out (`opacity: 0, y: -50`).
  - **20% to 65%**: Sequenced text highlight reveal (`scale: 0.8, opacity: 0` to `scale: 1, opacity: 1` to `scale: 1.05, opacity: 0`).
  - **65% to 85%**: Scale-in tracking card (`opacity: 1, scale: 1, y: 0`) and stats bar slides up (`y: 0`).
  - **85% to 100%**: Navigation bar fades back in, settling the screen layout before unpinning the viewport.
