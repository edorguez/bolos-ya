# Design System Document

## 1. Overview & Creative North Star: "The Vibrant Canvas"

This design system is built to transform a utilitarian experience into a high-energy, illustrative journey. Our Creative North Star is **"The Vibrant Canvas."** Unlike traditional financial or organizational apps that rely on rigid data grids, this system treats the mobile viewport as a living composition where data and illustration coexist in an organic, editorial flow.

We break the "template" look by prioritizing:
*   **Intentional Asymmetry:** Utilizing overlapping elements and off-center illustrations to create movement.
*   **Organic Fluidity:** A rejection of sharp corners in favor of extreme roundness (`round-3xl`) and soft, floating surfaces.
*   **High-Contrast Storytelling:** Using a sophisticated interplay between a pure white base and a bold, electric palette to guide the eye toward "moments of delight" rather than just rows of information.

## 2. Colors

The palette is designed to be high-chroma and unapologetic. It uses the pure white background as a stage for bold primary tones and soft, supportive accents.

### Primary Palette
*   **Primary (`#7139c7`):** The authoritative voice. Used for high-level branding and active states.
*   **Secondary (`#1222ff`):** The energy driver. Used for kinetic actions and momentum-based UI elements.
*   **Tertiary/Accent 2 (`#795500` / `#fac052`):** The "Sunny Yellow" warmth. Used for achievement markers and highlight states.
*   **Error (`#b41340`):** A sophisticated coral-red that warns without breaking the illustrative aesthetic.

### Layout & Surface Rules
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. Use `surface_container_low` (`#f0f1f1`) to define content areas against the `surface` background.
*   **Surface Hierarchy & Nesting:** Treat the UI as stacked sheets of physical material. A `surface_container_lowest` (#ffffff) card should sit atop a `surface_container` (#e7e8e8) section to create depth through tonal contrast rather than lines.
*   **The "Glass & Gradient" Rule:** To provide "soul" to the UI, use subtle linear gradients for primary CTAs (e.g., transitioning from `primary` to `primary_container`). For floating elements like navigation bars, employ Glassmorphism: use a semi-transparent `surface` color with a `backdrop-blur` of 20px.

## 3. Typography

We utilize **Plus Jakarta Sans** for its modern, geometric clarity and "clean" high-end feel.

*   **Display (lg/md/sm):** Reserved for hero illustrative moments and major milestones. These should feel like headlines in a premium magazine—bold and spacious.
*   **Headline (lg/md/sm):** Used for section titles. The high-energy nature of the app requires headlines to be punchy and provide immediate hierarchy.
*   **Title (lg/md/sm):** For card titles and actionable list headers.
*   **Body (lg/md/sm):** Set with generous line height to ensure the "pure white" background provides maximum breathing room.
*   **Labels:** Minimalist and often all-caps or high-tracking to distinguish from interactive data.

The relationship is "Editorial-Bold": Large, expressive headlines paired with clean, functional body text to ensure the UI feels like a curated story.

## 4. Elevation & Depth

In this system, depth is a feeling, not a structure. We move away from traditional Material Design shadows toward "Tonal Layering."

*   **The Layering Principle:** Stack `surface-container` tiers to create natural lift. Place a `surface_container_lowest` card on a `surface_container_low` background. This creates a soft, tactile separation that feels integrated.
*   **Ambient Shadows:** When a true "floating" element is required (e.g., a FAB or a modal), use an extra-diffused shadow:
    *   **Blur:** 24px - 40px
    *   **Opacity:** 5% - 8%
    *   **Color:** Use a tinted version of `on_surface` (a deep indigo-grey) rather than pure black to mimic natural light.
*   **The "Ghost Border" Fallback:** If a container requires further definition for accessibility, use the `outline_variant` token at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** Use semi-transparent layers for elements that overlap illustrations. This allows the vibrant color blocks of the illustrations to bleed through, softening the interface and making the floating elements feel lighter.

## 5. Components

### Buttons
*   **Primary:** High-roundness (`round-full`), using a gradient of `primary` to `primary_dim`. Bold `on_primary` text.
*   **Secondary:** `surface_container_high` background with `primary` text. No border.
*   **Tertiary:** Transparent background with `secondary` text.

### Cards
*   **Styling:** Always use `round-3xl` (2rem). 
*   **Constraint:** Forbid the use of divider lines. Separate internal card content using vertical white space (Scale 4 or 6) or a subtle shift to `surface_container_lowest` for nested items.

### Input Fields
*   **State:** Default state is a `surface_container_low` fill. 
*   **Focus:** Transition to a `ghost border` of `primary` at 20% and a subtle `primary_container` glow.

### Additional Signature Components
*   **The Progress Blob:** Instead of a linear progress bar, use organic, non-symmetrical shapes that fill with `secondary_fixed` color to track user milestones.
*   **Floating Navigation:** A glassmorphic dock with `round-full` corners, floating 1rem above the bottom of the screen, allowing the background illustrations to flow underneath.

## 6. Do's and Don'ts

### Do
*   **DO** use the Spacing Scale (especially 6, 8, and 10) to create "Editorial Air." Let the content breathe.
*   **DO** overlap illustrations with UI cards to create a sense of 3D space.
*   **DO** use `Accent 2 (Sunny Yellow)` sparingly as a "reward" color for completed tasks.

### Don't
*   **DON'T** use 1px solid dividers or borders. It kills the modern, illustrative vibe.
*   **DON'T** use default drop shadows. They make the UI look "dirty" compared to our pure white background.
*   **DON'T** crowd the screen. If an illustration is present, let it be the hero; don't fight it with dense text blocks.