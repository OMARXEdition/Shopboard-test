# Debugging log

## 2026-11-04 — Shared toast notifications

### Initial state

The toast implementation lived inside `src/modules/cart/cart.ui.ts`. Adding a
product displayed a temporary message, but other modules could not reuse that
function directly.

### Changes

- Added `src/shared/ui/toast.ts`, exporting `showToast(message, type)` and
  `ToastType` (`success`, `error`, or `info`; defaults to `info`).
- Removed the cart's private toast function and container query. The cart now
  imports the shared function and passes `success` after adding a product.
- Reused the single `#toast-region` container in `index.html`, which already has
  `role="status"` and `aria-live="polite"`.
- Added type-specific styles in `src/style.css`.
- Preserved the maximum of three visible messages, 3,200 ms display time, and
  250 ms exit transition. Messages use `textContent` rather than HTML.
- If the container is missing, the shared function returns without displaying
  a message.

### Verification

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: all 27 tests passed.
- `npm.cmd run build`: passed; Vite reported a chunk larger than 500 kB for the
  Three.js scene bundle.
- PowerShell blocked the `npm.ps1` launcher because script execution is disabled.
  Running the installed `npm.cmd` launcher completed the checks without changing
  the execution policy.

### Remaining manual checks

Browser behavior was not visually verified. Check add-to-cart feedback, each
message type, rapid consecutive messages, dismissal timing, and screen-reader
announcements. The existing test suite does not directly test the shared toast.
