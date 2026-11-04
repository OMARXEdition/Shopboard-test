# Nabta — نبتة

## Purpose

Transform Shopboard into Nabta, an Arabic plant shop. Replace electrical-device products and related content with plants and plant-care products. Preserve existing shopping behavior and the feature module architecture.

## Visual direction

Use the supplied botanical moodboard as inspiration: deep forest-green surroundings, layered sage-green surfaces, warm ivory text, rounded cards, organic shapes, spacious compositions, and clear plant photography. Create an original Nabta identity; do not copy the reference's Leafly branding or embed its text as UI.

Suggested palette (starting values, not sampled colors):

- Forest: #123D2B
- Deep background: #0B261D
- Sage: #8DAA73
- Pale sage: #DCE6D2
- Ivory: #F6F3E8
- Ochre accent: #C99B55
- Terracotta accent: #A66D50

Use dark text on light sage and ivory surfaces. Check contrast for text, controls, borders, and focus indicators; do not assume every palette pairing is accessible. Keep decoration behind content. Use subtle organic curves and generous corner radii without crowding product information.

## Language and direction

- Set the document language to Arabic and direction to RTL: `<html lang="ar" dir="rtl">`.
- Translate all customer-facing text into natural Arabic: navigation, product names, descriptions, category labels, filters, sorting, forms, validation, cart, empty states, notifications, accessibility labels, and footer.
- Use CSS logical properties such as margin-inline, padding-inline, and inset-inline-end. Order layouts and directional controls intentionally for RTL.
- Isolate Latin text and mixed-direction values using bdi or appropriate direction attributes. Preserve semantic keyboard and reading order.
- Keep internal code identifiers and stable product IDs independent of translated labels.
- Format prices with Intl.NumberFormat for the configured market. Preserve the existing currency until a different market/currency is specified; do not invent shipping, tax, or business policies.

## Typography

Use Aref Ruqaa from Google Fonts throughout the Arabic interface, with a serif fallback. Load supported regular and bold weights through the official Google Fonts stylesheet, with font-display: swap.

```css
font-family: 'Aref Ruqaa', serif;
```

Use generous line height and readable control sizes. Avoid letter-spacing on Arabic text, clipped dots/diacritics, synthetic weights, and narrow fixed-height buttons. Test text wrapping on small screens. Keep UI text as selectable text, not images. The final logo may use custom lettering, but interface typography must use the actual Aref Ruqaa font.

## Brand and logo

Arabic brand name: نبتة. Latin name: NABTA.
Explore a sprout emblem, an Arabic calligraphic wordmark, and a botanical seal. Present concepts for selection before choosing the permanent logo. Use a temporary text wordmark until a concept is chosen. The selected mark must remain legible in a small header and work in one color. Prepare a simplified icon for favicon use after selection.

## Plant catalog

Replace electronics with a coherent catalog of indoor plants, outdoor plants, succulents/cacti, pots, and plant-care supplies. Example products include مونستيرا، بوتس، زاميوكولكاس، سانسيفيريا، إشفيريا، أصيص فخاري، and تربة زراعية.

Each product needs a unique stable ID, Arabic name and description, numeric price, category, relevant image and Arabic alt text, and useful features. Use original prices or badges only when intentionally supplied; do not invent discounts, ratings, customer counts, or certifications.

For plants, add care details only where meaningful: light, watering guidance, and size. Verify species-specific claims, especially pet toxicity; omit unverified safety claims. Do not put plant-only required fields on pots or supplies. Model distinct product kinds with a discriminated union when their fields differ.

Use real plant photos that match each item, with consistent crop and lighting. Keep leaves visible and avoid electronics imagery, unrelated photos, and baked-in text. Use licensed or otherwise permitted assets and preserve required attribution.

## Pages and components

- Header: Nabta identity, Arabic navigation, search, and cart count in a clear RTL layout.
- Hero: one prominent plant image, a short Arabic headline such as "مساحة أجمل، بنبتة", and a clear "تسوّق النباتات" action. Keep headline and action as live HTML.
- Catalog: readable rounded cards with image, name, price, and "أضف إلى السلة". Provide Arabic search, category filters, sorting, and an informative no-results state.
- Cart: Arabic item details, quantity controls, remove action, subtotal, and empty state. Preserve keyboard navigation and return focus when closing its drawer.
- Showroom: feature plants with usable next/previous controls and correctly connected add-to-cart actions.
- Authentication: preserve existing behavior and translate labels, validation, and password scoring feedback. Do not imply server authentication exists if it does not.
- Footer: use only verified contact details and business information. Omit unavailable details.

## Responsive behavior and accessibility

Use mobile-first layouts with min-width breakpoints. Let the product grid adapt to available width; avoid horizontal overflow. Preserve image aspect ratios and enough space for Arabic text. Make touch targets comfortably sized, maintain visible focus, use semantic HTML and input labels, and respect prefers-reduced-motion. Test the cart, menus, and dialogs with keyboard navigation.

## Implementation boundaries

Follow AGENTS.md and the existing feature modules. Keep domain data/types, state, pure logic, and UI responsibilities separated. Compose features through main.ts. Add no dependency without approval.

Preserve the shopboard:cart storage key and saved arrays of { id, quantity }; derive prices from the current catalog. Ignore saved IDs that no longer exist after replacing electronics. Do not silently map an old electronics ID to a new plant. Preserve the existing build setup and unrelated work.

## Acceptance checks

- Customer-facing content is Arabic and the document is RTL.
- Aref Ruqaa loads correctly and Arabic letters/dots remain readable at mobile sizes.
- No electronics products, images, or promotional copy remain in the active storefront.
- Search, filters, sorting, cart quantities/totals, persistence, showroom, and existing forms still work.
- Empty states, validation, accessibility labels, and dynamic messages are translated.
- Selected colors have adequate contrast and all controls are keyboard usable.
- Run the project's typecheck, relevant tests, and build; report actual results and anything not verified.

## Instruction for Codex

Read this document and AGENTS.md, then inspect the current implementation. Briefly propose the affected files and any material missing decisions. Implement the Arabic Nabta plant-store redesign incrementally, preserving functionality and existing module boundaries. Use a temporary text logo until the user chooses a logo concept. Verify the acceptance checks and summarize changes and remaining limitations.
