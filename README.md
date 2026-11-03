# نبتة — Nabta

An Arabic plant-store demo built with vanilla TypeScript, Vite, and Three.js. Originally named Shopboard, Nabta combines a responsive right-to-left storefront with interactive product browsing and a customizable 3D plant preview.

<p align="center">
  <img src="src/assets/nabta-logo.png" alt="نبتة — Nabta" width="360" />
</p>

## Features

- **Arabic storefront:** RTL layouts, responsive navigation, Harmattan body text, and Aref Ruqaa headings with an ivory and forest-green botanical palette.
- **Product catalog:** Search plants and supplies, filter by category, and sort by price.
- **Shopping cart:** Add products, adjust quantities, remove items, and restore the cart after reloading.
- **3D Plant Corner:** Preview catalog plants in a procedural room, change pot and wall colors, adjust visual scale, and rotate the scene. Product images and shopping controls remain usable if WebGL fails.
- **Interactive showroom:** Browse products in a phone-style explorer using tabs, arrows, keyboard navigation, and swipe gestures.
- **Registration demo:** Native form validation, password visibility controls, and a password-strength indicator.
- **Local order history:** Review and confirm demo orders, then revisit saved product and price snapshots.
- **Accessibility considerations:** Labeled controls, keyboard interactions, visible focus states, and reduced-motion support.

## Demo scope

This is a frontend demonstration. Registration does not create a real account, and confirming an order does not submit a purchase, collect payment, arrange delivery, or synchronize data across devices.

Cart and order data are stored in the current browser's `localStorage`. Clearing browser storage removes that data. Plant Corner colors and sizes are visual preview settings, not purchasable variants. Prices use USD with Arabic locale formatting.

## Tech stack

| Area                  | Tools                                                   |
| --------------------- | ------------------------------------------------------- |
| Application           | Vanilla TypeScript with strict mode, semantic HTML, CSS |
| Development and build | Vite                                                    |
| 3D preview            | Three.js with procedural geometry                       |
| Tests                 | Node.js built-in test runner                            |
| Code quality          | ESLint, typescript-eslint, Prettier                     |
| Git hooks             | Husky and lint-staged                                   |
| Deployment            | GitHub Actions and GitHub Pages                         |

## Getting started

Use **Node.js 24 or newer** and npm. Node.js 24 was used to verify the project.

```sh
git clone https://github.com/OMARXEdition/Shopboard-test.git
cd Shopboard-test
npm ci
npm run dev
```

Open the local URL printed by Vite. The project uses `/Shopboard-test/` as its base path.

No environment variables, API keys, database, or backend service are required. Google Fonts requires an internet connection; fallback fonts are defined.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`.

## Available commands

| Command                | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Start the development server                       |
| `npm run typecheck`    | Check TypeScript without emitting files            |
| `npm test`             | Run the automated tests                            |
| `npm run lint`         | Check JavaScript and TypeScript with ESLint        |
| `npm run lint:fix`     | Apply available ESLint fixes                       |
| `npm run format`       | Format supported project files with Prettier       |
| `npm run format:check` | Check formatting without changing files            |
| `npm run build`        | Typecheck and create a production build in `dist/` |
| `npm run preview`      | Serve the production build locally                 |
| `npm run prepare`      | Configure Husky's Git hooks                        |

Before submitting changes, run:

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

The pre-commit hook runs lint-staged to lint and format staged JavaScript/TypeScript files and format staged HTML, CSS, JSON, and Markdown files. It then typechecks the whole project. Husky is initialized by the `prepare` script during dependency installation in a Git checkout.

## Project structure

```text
index.html                 Page structure and feature markup
src/
  main.ts                  Feature initialization and callback wiring
  style.css                Global styles and responsive layouts
  assets/                  Approved logo and local plant photographs
  shared/                  DOM helpers and currency formatting
  modules/
    auth/                  Registration UI and password scoring
    cart/                  Cart state, persistence, and dialog
    catalog/               Products, filtering, sorting, and cards
    orders/                Order snapshots, storage, review, and history
    plant-corner/          3D scene, preview controls, and fallback
    shell/                 Navigation, mobile menu, and reveal effects
    showroom/              Phone explorer and product navigation
tests/                     Domain and UI behavior tests
public/                    Static icons and favicon
.husky/                    Git commit hooks
.github/workflows/         GitHub Pages deployment workflow
```

Features separate pure calculations from browser UI and storage. `src/main.ts` connects features through callbacks. Shared product and cart contracts live in their owning feature's `*.types.ts` files.

### Persistence and rendering

- `shopboard:cart` stores product IDs and quantities; prices come from the current catalog. Legacy IDs remain compatible with existing saved carts.
- `nabta:orders` stores validated order snapshots, including names, quantities, timestamps, and money calculated in integer cents. The cart clears only after an order is saved successfully.
- The 3D engine loads near the viewport and renders on changes. Device pixel ratio is capped at 1.5, shadow maps at 512, and scene resources are disposed on teardown.

## Deployment

The repository includes a [GitHub Pages workflow](.github/workflows/deploy.yml) that installs dependencies, builds the app, and deploys `dist/` on pushes to `main` or manual workflow runs.

In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source. After a successful deployment, use the URL shown by the workflow's `github-pages` environment.

The base path in [vite.config.ts](vite.config.ts) is `/Shopboard-test/`. Update it when deploying under a different repository name or hosting path; use `/` for root hosting.

## Design and assets

See [Design.md](Design.md) for the approved brand, typography, palette, and interaction guidelines. The original Nabta logo is preserved with its complete canvas and proportions.

Plant photographs are local assets. Their source links and licensing notes are recorded in [SOURCES.md](src/assets/plants/SOURCES.md).

## License

No project-wide license file is currently included. Third-party asset terms are documented separately in the asset source notes.
