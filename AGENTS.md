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

