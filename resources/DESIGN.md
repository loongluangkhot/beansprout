# Design System Strategy: The Living Library

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Conservatory"**

This design system is not a rigid grid of boxes; it is a curated environment that breathes. Drawing inspiration from the quiet intentionality of a botanical garden and the intellectual warmth of a private library, the system rejects "standard" app layouts in favor of an **Editorial Sanctuary**. 

To move beyond a "template" look, we employ **Intentional Asymmetry**. Instead of centering every element, we use the spacing scale to create rhythmic offsets—allowing content to "grow" into white space. High-contrast typography scales (pairing an expansive display serif with a compact, functional sans) ensure that even the most information-dense screens feel like a well-composed magazine spread rather than a database.

---

## 2. Colors: Tonal Horticulture
The palette is grounded in the earth. We avoid digital blacks and harsh whites, opting instead for a spectrum of botanical greens and mineral neutrals.

### Palette Highlights
*   **Primary (`#4e6240`):** The deep chlorophyll of a forest leaf. Used for core brand moments.
*   **Surface (`#faf9f5`):** A warm, "book-bond" white that reduces eye strain and provides a tactile, paper-like foundation.
*   **Tertiary (`#8b4c00`):** Our "Terracotta" accent. Use this sparingly for "growth" moments, such as progress bars or notifications.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a soft, sophisticated edge that feels structural yet organic.

### Glass & Gradient Signature
To elevate the "out-of-the-box" feel, use **Glassmorphism** for floating elements like navigation bars or overlays. Use `surface` colors at 70-80% opacity with a `20px` backdrop-blur. 
*   **Signature Texture:** Main CTAs should utilize a subtle linear gradient from `primary` (`#4e6240`) to `primary-container` (`#667b57`) at a 145° angle to add depth and "soul."

---

## 3. Typography: The Literary Pairing
We pair the functional clarity of **Manrope** with the evocative, high-contrast personality of **Newsreader**.

*   **Display & Headlines (Newsreader):** This soft serif is our "literary voice." Use `display-lg` for welcome screens and `headline-md` for book titles. It should feel authoritative yet nurturing.
*   **Body & UI (Manrope):** Our "functional gardener." Use `body-md` for synopsis text and `label-md` for metadata (e.g., page counts, dates).
*   **The Hierarchy Rule:** Always maintain a significant scale jump between headlines and body text. If a headline is `headline-lg` (2rem), the subtext should be `body-md` (0.875rem) to create an editorial "tension" that looks premium.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We use the environment's "light" to create depth through stacking.

*   **The Layering Principle:** Depth is achieved by "stacking" surface-container tiers. 
    *   *Base Layer:* `surface`
    *   *Section Layer:* `surface-container-low`
    *   *Card Layer:* `surface-container-lowest`
*   **Ambient Shadows:** When an element *must* float (e.g., a "Join Club" FAB), use a tinted shadow: `Color: on-surface (10% opacity)`, `Blur: 24px`, `Y-Offset: 8px`. Never use pure grey or black shadows.
*   **The "Ghost Border" Fallback:** If a boundary is strictly required for accessibility, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Botanical Primitives

### Cards & Book Modules
*   **Rule:** Forbid divider lines. 
*   **Styling:** Use `roundedness-lg` (1rem). Separate book listings using `spacing-6` (2rem) of vertical white space or a subtle shift to `surface-container-low`.
*   **Interaction:** On tap, cards should subtly scale (0.98) rather than changing color.

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`), `roundedness-full`, `manrope` bold.
*   **Secondary:** No fill. `outline-variant` (20% opacity) "Ghost Border."
*   **Tertiary:** Text only in `primary` color, with an organic leaf icon (`0.5rem` spacing) as a trailing element.

### Inputs & Search
*   **Style:** Pill-shaped (`roundedness-full`). Background: `surface-container-high`. 
*   **Focus State:** The "Ghost Border" becomes 100% opaque `primary`, and the background shifts to `surface-container-lowest`.

### Progress Indicators (Growth Bars)
*   **Style:** Use `tertiary` (Terracotta) for the fill and `secondary-container` for the track. This represents the "earth" and the "bloom."

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins (e.g., `spacing-8` on the left, `spacing-4` on the right) for title headers to create an editorial look.
*   **Do** embrace "dead space." Let the `surface` color dominate at least 40% of every screen.
*   **Do** use `roundedness-xl` for large imagery (book covers) to soften the "tech" feel.

### Don’t
*   **Don’t** use 100% black text. Always use `on-surface` (`#1b1c1a`) for a softer, premium contrast.
*   **Don’t** use standard Material Design icons. Use "Fine Line" icons (1px stroke) with rounded terminals to match the botanical theme.
*   **Don’t** use "Alert Red" for errors if possible; use the `error` (`#ba1a1a`) token but wrap it in a `error-container` (`#ffdad6`) with high transparency to keep the mood calm.