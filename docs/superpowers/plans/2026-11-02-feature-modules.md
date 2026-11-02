# Feature modules implementation plan

**Goal:** Preserve Shopboard's interface and behavior while organizing its existing TypeScript by feature.

**Architecture:** Catalog owns product types, records, filtering, and cards. Cart owns its storage contract, state, dialog, and feedback. Auth owns password scoring and registration feedback. Showroom owns phone browsing. Main connects add-to-cart callbacks. Page navigation/reveal effects live in a shell UI module. Only DOM helpers and currency formatting are shared.

**Constraints:** No dependencies; preserve CSS, markup, `shopboard:cart`, and saved `{ id, quantity }` records. Keep calculations and filtering independent of the DOM. Retain the existing JavaScript Node tests.

- [x] Cart: extract storage/state types and cart UI; update cart test imports; run cart tests and typecheck.
- [x] Catalog: move product types/data, filtering, and card rendering; keep button feedback in catalog; update catalog test imports; run tests and typecheck.
- [x] Auth: move pure password scoring and password/registration UI; update tests; run tests and typecheck.
- [x] Showroom/shell: extract phone controls and page navigation/reveal effects; connect features in main; remove obsolete layer files.
- [ ] Document feature boundaries in AGENTS.md; run tests, typecheck, build, and browser checks for cart persistence/actions, catalog controls, auth feedback, showroom controls, and navigation.

Review focus: saved cart reloads, add-to-cart feedback from both entry points, filtering followed by cart actions, registration visibility reset, and showroom wraparound. Preserve reduced-motion behavior and focus handling.

Command-line verification and structural review passed. Browser verification was blocked by an unavailable browser host and a native Firefox access approval timeout. The subsequent user request authorizes a Nabta visual redesign while preserving this feature structure.
