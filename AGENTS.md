# AGENTS.md

## Project overview
Nabta (نبتة), originally Shopboard, is an Arabic plant-store web app built with Vite and vanilla TypeScript.

## Design
- Read `Design.md` before changing the storefront appearance or brand assets.
- Use Arabic RTL layouts, Harmattan for body text and controls, and Aref Ruqaa for headings.
- Use the approved original `src/assets/nabta-logo.png` in the header and footer on ivory; preserve its complete canvas, proportions, colors, and lettering. Alt text: `نبتة — Nabta`.

## Stack
Vite (vanilla), TypeScript, HTML, CSS

## Commands
- Install: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Typecheck: `npm run typecheck`
- Tests: `npm test`

## Project structure
- `index.html` - app entry page
- `src/modules/cart/` - cart types, state, persistence, dialog, and cart feedback
- `src/modules/catalog/` - product types, catalog data, pure filtering/sorting, cards, and catalog controls
- `src/modules/auth/` - pure password scoring and registration/password UI
- `src/modules/showroom/showroom.ui.ts` - phone explorer, product tabs, and swipe/keyboard navigation
- `src/modules/shell/shell.ui.ts` - page navigation, mobile menu, and scroll reveal effects
- `src/shared/dom.ts` - DOM helpers used by multiple feature UIs
- `src/shared/format-price.ts` - currency formatting used by cart, catalog, and showroom
- `src/main.ts` - initializes features and connects their callbacks
- `src/style.css` - global styles
- `src/assets/` - images and SVGs used by the code
- `public/` - static files served as-is (favicon, icons)

## Module conventions
- Use ES module imports and exports with explicit `.ts` extensions for local modules.
- Organize code by feature under `src/modules/`; create files only for real responsibilities.
- Catalog owns `Product` and `ProductSelection` in `catalog.types.ts`; other features use `import type` for these contracts.
- Cart owns `CartState`, `CartItem`, and `CartStorage` in `cart.types.ts`, and persistence in `cart.state.ts`.
- Preserve the `shopboard:cart` key and saved arrays of `{ id, quantity }`; derive prices from the current catalog.
- Keep calculations, password scoring, filtering, and sorting independent of the DOM and storage.
- Put DOM access, browser events, rendering, and animations in feature `*.ui.ts` files. Shared DOM primitives belong in `shared/dom.ts`.
- Keep `main.ts` limited to CSS imports, feature initialization, and callback wiring. Connect catalog/showroom cart actions here rather than importing another feature's UI.
- Keep helpers in their owning feature unless multiple features use them; only then move them into `shared/`.
- Keep dependency direction from shared helpers/domain contracts to feature logic/state/UI, composed by main. Avoid circular imports.
- Use strict TypeScript and narrow missing values before accessing their properties. Prefer runtime guards to non-null assertions.
- Run typecheck, tests, and build after changing module interfaces or imports.

## Code style
- Semantic HTML first.
- Every input has a label.
- Mobile-first, min-width media queries.
- No `!important`.

## Rules for the agent
- Explain every change.
- Run `npm run build` to check nothing is broken before finishing a task.
- Ask before adding new dependencies.
- Never edit `package-lock.json` by hand or touch `node_modules/`.
- Never commit secrets or `.env` files.

