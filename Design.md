# نبتة — Nabta

## Approved brand direction

Arabic plant store with a warm, calm botanical identity. Use Arabic right-to-left layouts, ivory surfaces, forest green text and primary actions, olive secondary accents, and restrained gold details. Keep the existing feature modules and shopping interactions.

This file was empty when implementation began; the palette and layout below follow the supplied logo and the user's Arabic plant-store request.

## Approved logo

- The user-supplied sprout logo with Arabic «نبتة» and Latin «NABTA» is approved.
- Original asset: `src/assets/nabta-logo.png` (1536 × 1024 PNG).
- Display this image in the website header and footer. The header logo links to the homepage using `./`, compatible with the Vite base path.
- Alt text: `نبتة — Nabta`.
- Preserve the original artwork, colors, proportions, Arabic lettering, and complete ivory canvas. Do not redraw, crop, stretch, recolor, or apply filters to the logo.
- Keep `height: auto` and `object-fit: contain`; use responsive widths and an ivory surrounding surface. Other photos may use `object-fit: cover`; the logo may not.
- The original file is intentionally retained at full quality. Vite fingerprints the asset for production.

## Typography and palette

- Body text and controls: Harmattan, weights 400 and 700, with a sans-serif fallback. Headings: Aref Ruqaa, weights 400 and 700, with a serif fallback. Do not replace website text with the logo lettering.
- Ivory: `#fdfaf0` (sampled from the supplied logo's corner); forest green: `#254b36`; olive: `#78885c`; muted green: `#65715e`; soft sage: `#eef1e5`; gold: `#c89c51`.
- Use generous Arabic line heights, clear focus states, visible input labels, and touch targets of at least 44px.
- Mobile-first layouts expand into two-column hero/showroom/registration sections and a three-column catalog. Avoid fixed-width page content and horizontal overflow.

## Page composition

1. Short green announcement strip and ivory navigation with approved logo and cart counter.
2. Arabic editorial hero, arched botanical photograph, plant-shopping CTA, and a quiet care message.
3. Plant collection with search, category selection, price sorting, and existing add-to-cart behavior.
4. Forest-green brand statement, then the interactive product phone showroom.
5. Community registration and password controls, followed by an ivory footer with the approved logo.
6. Matching Arabic cart dialog, quantity controls, and toast feedback.
7. A «طلباتي» section after registration with an empty state, newest-first order cards, expandable product details, and an explicit refresh control.

## 3D Plant Corner

- Between the hero and catalog, show «صمّم ركنك الأخضر» and «اختر نبتتك وأصيصها، وشاهدها في مساحتك.».
- Use an ivory preview panel, forest-green actions, sage details, rounded corners, Harmattan body text and Aref Ruqaa headings. Controls stack on mobile, use a compact two-column grid on tablet, and sit beside the room on desktop.
- The room is procedural Three.js geometry: two walls, a warm floor, oval rug, wooden side table, matte pot, and stylized foliage. Monstera, snake plant and ZZ plant reference the existing catalog; rubber plant becomes eligible only if it exists there.
- Pot color, wall color, and visual size change the preview only. Add only the selected catalog product ID to the cart; display «معاينة تصوّرية؛ قد تختلف الألوان والأحجام الفعلية.» and explain that preview settings are not purchased variants.
- «عرض النبتة» selects the same product in the existing phone showroom. Confirm actions only after the corresponding callback succeeds.
- Drag horizontally or use the labeled rotation/reset buttons. Clamp rotation to ±22° and never auto-rotate. Preserve vertical touch scrolling with `touch-action: pan-y`.
- Lazy-load the engine within 240px of the viewport. Render on change/resize, cap pixel ratio at 1.5 and shadow maps at 512. Keep product imagery, labels, selection summary, product viewing, and cart actions usable while loading or after WebGL failure; provide a retry button.
- Dispose scene meshes/materials/shadows/renderer, observers, event listeners, pending frames and late-loading scenes when destroyed. Main wires feature callbacks and HMR cleanup.

## Local demo orders

- Cart footer includes «مراجعة الطلب», disabled when the cart is empty. It opens a separate Arabic review dialog with line quantities, prices, and total.
- «تأكيد الطلب التجريبي» saves a snapshot under `nabta:orders`, then clears and refreshes the cart. Cancel/Escape returns to the cart without placing an order.
- Order history uses the same ivory/green design, Harmattan body text, Aref Ruqaa headings, and responsive cards. Keep full order identifiers readable with wrapping and direction isolation.
- Show browser-local/demo limitations beside history and confirmation; there is no payment, shipping, or backend submission.
- Historical names/prices are immutable snapshots; calculate money using integer cents. Duplicate confirmations cannot create duplicate IDs. Save failures keep the cart and review intact for retry.
- Validate saved records. Report unreadable history without overwriting it; ignore individual invalid records in otherwise readable history.

## Behavior and content

- Feature ownership remains in `src/modules/`; shared helpers stay in `src/shared/`.
- Keep `shopboard:cart`, saved `{ id, quantity }` arrays, stable product IDs, numeric prices, totals, and USD currency. Prices use Arabic locale formatting without converting currency.
- Catalog content now represents plants and growing supplies. Legacy internal IDs remain for saved-cart compatibility.
- Preserve search/filter/sort, cart add/increase/decrease/remove/clear/reload, mobile navigation, password strength/visibility, native form validation, and showroom picker/arrows/swipe/details/add-to-cart.
- Registration remains a frontend demonstration; its feedback must not claim a real account was provisioned.
- Respect reduced-motion preferences. Keep email input left-to-right inside the Arabic form.
- Plant and supply photographs are local JPEG assets in `src/assets/plants/`, sourced from Pexels and visually checked against their subjects. The hero uses a monstera by a window; catalog and showroom share the same product images. Source links and licensing information are recorded in `src/assets/plants/SOURCES.md`. The approved logo remains separate and unchanged.
- RTL showroom behavior: the left arrow advances, the right arrow goes back, and dragging right reveals the next item. Navigation wraps around at either end.
