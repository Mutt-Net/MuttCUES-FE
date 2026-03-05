# MuttCUES-FE

React 18 / TypeScript 5 / Vite 7 frontend for image upscaling and DDS conversion. Polls for job status; proxies `/api` to the API at port 8080.

## Commands

```bash
npm run dev      # Vite dev server on port 5173 (proxies /api → localhost:8080)
npm run build    # Production bundle to ./dist
npm test         # Run Vitest
npx vitest run   # Run tests (non-interactive)
npx tsc --noEmit # Type check (no ESLint; TypeScript strict mode is the linter)
```

Tests live in `src/tests/`.

## Architecture

```
src/
├── components/
│   ├── ImageProcessor.tsx   # Upscaling feature; uses fileservice + jobservice
│   ├── DdsConverter.tsx     # DDS conversion feature
│   ├── DdsConverter.css     # Component-scoped styles
│   └── FileUpload.tsx       # Shared upload UI
├── api/
│   ├── fileservice.ts       # Upload/download with progress callbacks
│   └── jobservice.ts        # Polls job status until complete/failed
├── styles/                  # Global styles
├── tests/
│   ├── app.test.tsx
│   └── setup.ts
├── App.tsx
└── main.tsx
```

## Conventions

- Functional components only; 2-space indentation; double quotes; semicolons required
- Component structure: state → refs → effects → handlers → render
- CSS is component-scoped — keep `Component.css` alongside `Component.tsx`
- Path alias `@/*` maps to `src/*`
- All API calls go through `src/api/`; never call `fetch`/`axios` directly in components
- Job polling lives in `jobservice.ts`; don't duplicate polling logic in components
