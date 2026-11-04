# AGENTS.md

## Project overview

Shopboard is a small web app built with Vite and vanilla JavaScript.

## Stack

Vite (vanilla), HTML, CSS

## Commands

- Install: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Project structure

- `index.html` - app entry page
- `src/main.js` - main JavaScript entry point
- `src/style.css` - global styles
- `src/assets/` - images and SVGs used by the code
- `public/` - static files served as-is (favicon, icons)

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
- Never hardcode products in the HTML. Always render them from `src/products.js`.
- Keep code in separate modules (data, logic, cart, page, main). Never put everything in one file.
- Only one file may touch the DOM. All other files must have no `document` or `querySelector`.
- Never add event listeners inside a render function. Add them once, or use event delegation, so one click adds one item.
- After every change, explain what you changed, in which file, and why.
- Besure that you inserted the photos of the products correctlly and it appears to the user.
- Ask for requists details before adding new feature.
- Before applying new design follow the Design.md folder and besure that the new desgin will follow the file instructions.
- summerize the prompt to muliple points and ask me if the summerized points is the thing i ,and ask my permission to apply it.
- organize the code and make the shared function in a single file so the entire program can call it and use it.
