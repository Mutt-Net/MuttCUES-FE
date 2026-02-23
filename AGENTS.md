# Stratum Agent Configuration: MuttCUES-FE

## Build Command
```bash
npm run build
```
This runs `vite build` and outputs optimized bundles to `./dist`.

## Test Command
```bash
npx vitest run
```
The project uses Vitest for testing. Tests are located in `src/tests/`.

## Lint Command
```bash
npx tsc --noEmit
```
No dedicated ESLint/Prettier configured. TypeScript strict mode provides type checking.

## Project Structure
```
MuttCUES-FE/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component
│   ├── api/
│   │   ├── fileservice.ts    # File upload/download API
│   │   └── jobservice.ts     # Job processing API
│   ├── components/
│   │   ├── ImageProcessor.tsx
│   │   ├── DdsConverter.tsx
│   │   ├── DdsConverter.css
│   │   └── FileUpload.tsx
│   ├── styles/
│   │   └── main.css
│   └── tests/
│       └── app.test.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── Dockerfile.frontend
├── nginx.conf
└── .github/workflows/docker-frontend.yml
```

## Coding Conventions

### TypeScript
- **Strict mode enabled** in `tsconfig.json`
- **Module resolution**: Node style with ESNext modules
- **Path alias**: `@/*` maps to `src/*`
- **JSX**: `react-jsx` (modern transform)
- **Target**: ES2020

### React Patterns
- **Functional components** with hooks (no class components)
- **Type annotations** on component props using `React.FC` or inline types
- **Event types** explicitly typed (e.g., `DragEvent<HTMLDivElement>`, `React.ChangeEvent<HTMLInputElement>`)
- **Custom hooks** extracted for reusable logic (e.g., polling in ImageProcessor)

### File Naming
- **Components**: PascalCase (e.g., `ImageProcessor.tsx`)
- **Utilities/API**: camelCase (e.g., `fileservice.ts`, `jobservice.ts`)
- **Styles**: Match component name (e.g., `DdsConverter.css` for `DdsConverter.tsx`)

### Code Style
- **Semicolons**: Required
- **Quotes**: Double quotes for strings
- **Indentation**: 2 spaces
- **Arrow functions**: Preferred for callbacks and inline handlers
- **Async/await**: Preferred over Promise chains

### API Conventions
- **Base URL**: `/api` (proxied by Vite/Nginx)
- **Response types**: Defined as TypeScript interfaces
- **Error handling**: Try/catch with console.error for debugging
- **Progress callbacks**: Functions accepting `(percent: number) => void`

### Component Structure
```tsx
import React, { useState } from "react";
import { someFunction } from "../api/someservice";

interface Props {
  // typed props if needed
}

export function ComponentName() {
  // 1. State declarations
  const [state, setState] = useState<Type>(initialValue);
  
  // 2. Refs
  const ref = useRef<ElementType>(null);
  
  // 3. Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  // 4. Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // 5. Render
  return <div>...</div>;
}
```

### CSS Conventions
- **Component-scoped CSS**: Each major component has its own `.css` file
- **BEM-like naming**: `.block`, `.block-element`, `.block--modifier`
- **CSS variables**: Not currently used, but supported
- **Responsive**: Media queries at component level (see `DdsConverter.css`)

## Dependencies

### Runtime
- `react`: ^18.2.0
- `react-dom`: ^18.2.0

### Development
- `typescript`: ^5.0.0
- `vite`: 7.3.1
- `@vitejs/plugin-react`: ^5.1.4
- `@types/react`: ^18.2.0
- `@types/react-dom`: ^18.2.0

### Testing (inferred from test file)
- `vitest`: (not in package.json, should be added)
- `@testing-library/react`: (not in package.json, should be added)

## Notes for Agents
1. **Test scripts missing**: The `package.json` lacks a `test` script. Consider adding `"test": "vitest"` to scripts.
2. **No linter**: Project relies solely on TypeScript for code quality.
3. **Docker-first deployment**: Primary deployment is via Docker with Nginx.
4. **Backend dependency**: Requires Spring Boot API at `http://localhost:8080` for full functionality.
