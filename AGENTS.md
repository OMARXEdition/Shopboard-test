# AGENTS.md

## Project overview

Shopboard (Nabta) is a Vite storefront built with vanilla TypeScript, semantic HTML,
and CSS. The optional 3D plant corner uses Three.js.

## Commands

- Install locked dependencies: `npm ci`
- Run dev server: `npm run dev`
- Type check: `npm run typecheck`
- Test: `npm test`
- Lint: `npm run lint`
- Format: `npm run format`
- Check formatting: `npm run format:check`
- Build: `npm run build`
- Preview build: `npm run preview`
- On Windows, use `npm.cmd` / `npx.cmd` when PowerShell blocks the `.ps1` launchers.

## Project structure

- `index.html` - page shell and accessible landmarks
- `src/main.ts` - connects feature modules
- `src/modules/catalog/` - product data, filtering, sorting, and catalog UI
- `src/modules/cart/` - cart state, persistence, and cart UI
- `src/modules/auth/` - sign-up validation and form UI
- `src/modules/orders/` - order validation, persistence, review, and history UI
- `src/modules/showroom/` - product detail UI and navigation
- `src/modules/shell/` - shared page navigation and shell interactions
- `src/modules/plant-corner/` - plant selection logic, Three.js scene, and controls
- `src/shared/dom.ts` - DOM query helpers
- `src/shared/format-price.ts` - shared price formatting
- `src/shared/ui/toast.ts` - shared toast messages
- `src/style.css` - global styles
- `src/assets/` - bundled images and SVGs
- `public/` - static files served as-is
- `tests/` - Node test suite
- `Design.md` - design requirements; read before changing the design
- `debugging-log.md` - evidence, causes, fixes, and AI involvement for actual bugs

## Code style and architecture

- Use semantic HTML and give every input a label.
- Use mobile-first, min-width media queries. No `!important`.
- Render products from `src/modules/catalog/catalog.data.ts`; never hardcode them in HTML.
- Keep data, logic, state, UI, and main wiring in separate modules.
- Keep DOM access in `*.ui.ts`, `src/shared/dom.ts`, and `src/shared/ui/` modules. Logic, state, data, and main wiring must not query or mutate the DOM.
- Bind listeners once during initialization or use event delegation. Never add listeners inside render functions.
- Check that product photos match their products and visibly load in the browser when changing product data or images.

## Working with the user

- Summarize the request in clear points and ask whether it is correct before starting a new task. An explicit instruction to apply an already discussed checklist authorizes that work.
- Ask for details before adding a new feature.
- Before a design change, read `Design.md` and follow its requirements.
- After changes, explain what changed, which files changed, and why.
- Ask before adding dependencies. An explicit request to install named tools authorizes those tools.
- Let npm update `package-lock.json`; never edit it by hand. Do not manually edit `node_modules/`.
- Never commit secrets or `.env` files.
- Before finishing, run lint, typecheck, tests, and build. Report failures honestly and distinguish automated checks from browser checks.
- Keep the pre-commit hook running `npx lint-staged` and typecheck. Store lint-staged configuration in `package.json`.
- Use commit messages that describe the change, such as `Configure linting and pre-commit checks`, instead of `shopboardv2` or `small change`.

## Rules from my mistakes

- The AI gave me a local source import to run on GitHub Pages, and it failed with a MIME-type error. Check whether I am testing locally or on the deployed site before giving Console commands; production uses Vite's built assets.
- An old Pages workflow uploaded the whole repository without building it. Keep one Pages workflow that installs dependencies, builds the app, and publishes `dist`.
- The lint script was present, but ESLint could not run in this checkout. Install the locked dependencies and actually run each check before saying the tooling works.
- My debugging log described a refactor instead of explaining bugs. Record the symptom, type, evidence, file and line, cause, fix, and AI involvement; say when historical evidence is incomplete.
- My instructions still named JavaScript files after the TypeScript migration and said only one file could touch the DOM after the UI was split into features. Update paths and architecture rules when the structure changes.
- I had to ask the AI to keep shared behavior reusable. Put shared functions such as toast notifications in one shared module and import them from each feature.
