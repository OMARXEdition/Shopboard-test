# Local orders implementation plan

Approved scope: the user's accepted proposal in conversation adds cart review/confirmation and browser-local order history, with no backend or new dependencies.

- [x] Add failing tests for order snapshots/totals, validation, history reload, duplicate IDs, storage failure, confirmation and cancellation.
- [x] Implement `orders.types.ts`, pure `orders.logic.ts`, and `orders.state.ts` with the `nabta:orders` key.
- [x] Implement `orders.ui.ts`; wire cart review and successful cart clearing through callbacks in main.
- [x] Add Arabic RTL order history/review markup and styles; preserve the approved logo, fonts, and existing shopping behavior.
- [x] Document module ownership, local demo limitations, and saved snapshots in AGENTS.md and Design.md.
- [x] Complete final code review and run typecheck, relevant tests, and build.

Key checks: integer-cent arithmetic, stable snapshots after catalog changes, no duplicate confirmation, cart untouched on failed order persistence, and Escape/cancel returning to cart.

Verification: reviewer found no important issues; 18 tests, typecheck, and build pass. UI handlers are tested at a minimal DOM boundary, and the running dev server serves the orders markup. A native browser visual check was not performed.
