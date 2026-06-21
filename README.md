# Ingredient Recipe Finder

A full-stack local app for finding simple recipes from ingredients you already have.

## Stack

- React + Vite + TypeScript frontend
- Node.js + Express API
- Local JSON seed data for recipes and ingredient nutrition estimates
- Vitest for helper and component tests

## Run Locally

```bash
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:5173` and proxies API calls to the Express server on `http://localhost:3001`.

## API

- `GET /api/recipes`
- `POST /api/recipes/search`

Search payload:

```json
{
  "ingredients": ["chicken", "rice", "onion"]
}
```

## Tests

```bash
npm test
```

Tests cover ingredient normalization, recipe matching/ranking, nutrition calculation helpers, and the ingredient search form.

## Production Build

```bash
npm run build
npm start
```

The production server serves the built frontend from `dist/client` and the API from the same Express app.
