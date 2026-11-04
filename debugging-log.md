# Debugging log

These entries use errors from the project conversation and repository history.
Historical commits establish the code involved; they do not prove which browser
tools were used at the time. Those observations are not invented here.

## Dependency and build follow-up

- The npm audit findings came from `minimatch@10.2.6` in the lint toolchain. `package.json` overrides it to patched `11.0.1` because the current ESLint and TypeScript ESLint releases still request version 10. This is a major-version override: recheck lint and staged-file checks when updating these tools, and remove the override when their dependencies include a patched release. See [the advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249).
- The optional Three.js scene was already dynamically imported, but its library output exceeded Vite's default 500 kB warning threshold. `vite.config.ts` now uses a Three.js chunk group with a 500,000-byte source-size target to split the core and renderer builds. The warning threshold remains unchanged. See [Rolldown's chunking documentation](https://rolldown.rs/reference/OutputOptions.codeSplitting).

## Bug 1

- **What I saw:** Testing the error toast on GitHub Pages failed with `NS_ERROR_CORRUPTED_CONTENT`, a disallowed MIME type (`text/html`), and a dynamic import error.
- **Type:** runtime
- **How I found it:** The browser Console and failed GET request I reported while testing the deployed site.
- **Cause:** The AI-provided Console snippet used `import('/src/shared/ui/toast.ts')`. This was a development-server URL, not a deployed module URL. `src/shared/ui/toast.ts:3` exports the function, but Vite bundles it for production. The leading slash also omitted the `/Shopboard-test/` base configured in `vite.config.ts:4`.
- **Fix:** Use the running Vite development server to import the source module. To preview only the deployed error styling, create a temporary `.toast.toast--error` element in `#toast-region` and remove it after four seconds. That preview does not test the exported function. No production source change was needed.
- **Did I use AI? For what?** Yes. AI supplied the original snippet, incorrectly assumed I was running locally, then explained the deployment difference and supplied the temporary styling preview. I did not report a successful preview afterward.

## Bug 2

- **What I saw:** Repository history contained a GitHub Pages workflow that published unbuilt source alongside the Vite deployment workflow. A failed deployment or browser symptom from that time is not recorded in the available evidence.
- **Type:** runtime
- **How I found it:** Inspecting the workflow added by commit `f564bd6` and removed by `804ab15`, then comparing it with `.github/workflows/deploy.yml`.
- **Cause:** Historical `.github/workflows/static.yml:40` used `path: '.'` and had no dependency installation or build step. A static host does not transform Vite source imports or resolve npm dependencies. Both workflows also targeted Pages on pushes to `main`.
- **Fix:** Commit `804ab15` removed the duplicate static workflow. Keep `.github/workflows/deploy.yml`, which installs dependencies, runs the production build, and uploads `dist`.
- **Did I use AI? For what?** AI inspected the historical workflow and explained the source-versus-build problem for this log. The Git history does not establish whether AI was involved in the original workflow change.

## Bug 3

- **What I saw:** The lint script existed, but `npm.cmd run lint` failed with `'eslint' is not recognized as an internal or external command`.
- **Type:** runtime
- **How I found it:** Running the lint command in the terminal during the checklist review.
- **Cause:** `package.json:8` invoked `eslint`, but the current dependency installation did not provide its executable. Having ESLint listed in `devDependencies` did not mean the checkout had a complete installation.
- **Fix:** Run `npm.cmd ci` to install the locked dependencies, then rerun lint. In this PowerShell environment, use `npm.cmd` because the execution policy blocks the `npm.ps1` launcher. Do not weaken the execution policy just to run npm.
- **Did I use AI? For what?** Yes. AI reproduced the missing-command error, identified the incomplete installation, and ran the installation and verification commands. Final verification results are reported with the task.

## Bug 4

- **What I saw:** Once ESLint was installed, lint reported three `no-undef` errors for `document` in `assets/product-array-lab.js` (lines 2, 7, and 52 before formatting).
- **Type:** runtime
- **How I found it:** Running `npm.cmd run lint`; this was a tooling environment error, not an observed browser crash.
- **Cause:** `eslint.config.js` assigned Node globals to all JavaScript files and browser globals only to TypeScript under `src`. The learning page's JavaScript runs in the browser, where `document` exists.
- **Fix:** Add browser globals for `assets/**/*.js` in `eslint.config.js`, while keeping Node globals for the test and configuration scripts. Rerun lint to verify.
- **Did I use AI? For what?** Yes. AI ran lint, traced the errors to the environment configuration, and added the browser-specific configuration.
