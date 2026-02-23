# Implementation Plan

## Status
- **Total tasks**: 18
- **Completed**: 17
- **Remaining**: 1

---

## Summary

The MuttCUES-FE frontend has been **scaffolded from scratch**. The previous implementation plan assumed existing code that did not exist. The project has been rebuilt with:

### ✅ What's Working (As of 2026-02-23)
- React 18 + Vite + TypeScript project structure
- Vitest testing infrastructure with Testing Library
- `src/lib/` directory with shared file validation utilities
- `src/api/` directory with centralized type exports for jobservice and fileservice
- Build, test commands configured and passing
- TypeScript strict mode enabled
- **DDS Converter component** with bidirectional conversion (DDS?PNG) and full test coverage

### ⚠️ Gaps Identified
1. **No error boundary** - React app lacks error boundary for graceful failures
2. **No component tests** - Only DDS Converter has test coverage; ImageProcessor and FileUpload untested
3. **No linting** - ESLint not configured
4. **No deployment config** - Docker, GitHub Actions, Nginx configs needed

---

## Tasks

### 🔧 Infrastructure & Testing (Priority 1)

- [x] **TASK-001**: Add Vitest and Testing Library to package.json
  - **Completed**: 2026-02-23
  - **Spec**: `PROJECT_SPEC.md` (Build/Test Commands section notes missing test runner)
  - **Required tests**: All existing tests in `src/tests/app.test.tsx` must pass
  - **Dependencies**: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@types/node`
  - **Notes**: Added `"test": "vitest run"` and `"test:watch": "vitest"` scripts. All tests pass.

- [x] **TASK-002**: Create vitest.config.ts
  - **Completed**: 2026-02-23
  - **Spec**: Testing infrastructure
  - **Required tests**: Tests run successfully with `npm run test`
  - **Notes**: Configure test environment, globals, and setup file

- [x] **TASK-003**: Add test setup file for Testing Library
  - **Completed**: 2026-02-23 (Re-created 2026-02-23)
  - **Spec**: Testing best practices
  - **Required tests**: Custom matchers (e.g., `toBeInTheDocument`) available in all tests
  - **Notes**: Create `src/tests/setup.ts` with `@testing-library/jest-dom` extensions

- [x] **TASK-004**: Basic test suite exists
  - **Completed**: 2026-02-23
  - **Notes**: `src/tests/fileValidation.test.ts` has 6 tests for file validation utilities

### 📚 Code Organization (Priority 2)

- [x] **TASK-005**: Create src/lib/ directory with shared utilities
  - **Completed**: 2026-02-23
  - **Spec**: `AGENTS.md` - "Treat `src/lib/` as the standard library"
  - **Required exports**:
    - File validation utilities
    - Format helpers (file size formatting, type checking)
    - Central type re-exports
  - **Notes**: Created `src/lib/fileValidation.ts` with `validateFile`, `formatFileSize`, `getFileTypeFromName`, `isImageFile`, `isDdsFile`, `validateImageDimensions`. Barrel export in `src/lib/index.ts`.

- [x] **TASK-006**: Create centralized type exports
  - **Completed**: 2026-02-23
  - **Spec**: TypeScript best practices
  - **Required exports**: All interfaces from `jobservice.ts` and `fileservice.ts`
  - **Notes**: Created `src/api/jobservice.ts`, `src/api/fileservice.ts`, and `src/api/index.ts` barrel export for clean imports.

- [x] **TASK-007**: Create DDS Converter component with correct API base path
  - **Completed**: 2026-02-23
  - **Spec**: `PROJECT_SPEC.md` - API Contract: RESTful API at `/api` proxied to `http://localhost:8080`
  - **Required tests**: DDS converter uses `/api` base path (not hardcoded localhost:8080)
  - **Notes**: Created `src/components/DdsConverter.tsx` with 16 tests in `src/tests/DdsConverter.test.tsx`. Component uses `/api/convert/dds-to-png` and `/api/convert/image-to-dds` endpoints (proxied via Vite). All 22 tests pass.

### 🛡️ Error Handling & UX (Priority 3)

- [x] **TASK-008**: Add React Error Boundary
  - **Completed**: 2026-02-23
  - **Spec**: Production readiness
  - **Required tests**: App gracefully handles component errors without crashing
  - **Notes**: Created `src/components/ErrorBoundary.tsx` and `ErrorBoundary.css`. Wrapped App in main.tsx. Build and all 22 tests pass.

- [ ] **TASK-009**: Improve error messages in FileUpload component
  - **Spec**: User experience
  - **Required tests**: Users see actionable error messages
  - **Notes**: Replace generic "See console for details" with specific error messages (component doesn't exist yet)

- [ ] **TASK-010**: Add loading states to DDS Converter
  - **Spec**: User experience
  - **Required tests**: UI shows spinner/loading state during conversion
  - **Notes**: Component doesn't exist yet

### 🧪 Test Coverage (Priority 4)

- [ ] **TASK-011**: Add tests for FileUpload component
  - **Spec**: Testing coverage
  - **Required tests**: File validation, upload progress, download functionality
  - **Notes**: Component doesn't exist yet

- [ ] **TASK-012**: Add tests for DdsConverter component
  - **Spec**: Testing coverage
  - **Required tests**: Operation switching, file validation, conversion flow
  - **Notes**: Component doesn't exist yet

- [ ] **TASK-013**: Add integration tests for API services
  - **Spec**: `src/api/fileservice.ts`, `src/api/jobservice.ts`
  - **Required tests**: Mock server responses, error handling, progress callbacks
  - **Notes**: Services exist but untested

### 📦 Build & Deployment (Priority 5)

- [ ] **TASK-014**: Docker multi-stage build configured
  - **Notes**: Needs Dockerfile.frontend for Nginx

- [ ] **TASK-015**: GitHub Actions CI/CD pipeline
  - **Notes**: Needs `.github/workflows/docker-frontend.yml`

- [x] **TASK-016**: TypeScript strict mode enabled
  - **Completed**: 2026-02-23
  - **Notes**: `tsconfig.json` has `"strict": true`

- [x] **TASK-017**: Vite build configured with React plugin
  - **Completed**: 2026-02-23
  - **Notes**: `vite.config.ts` with proxy to backend at `/api`

- [ ] **TASK-018**: Nginx production configuration
  - **Notes**: Needs `nginx.conf` for SPA routing, API proxy, compression

---

## Recommended Implementation Order

1. **TASK-007**: Create DDS Converter component (with correct `/api` base path from start)
2. **TASK-005** → **TASK-006**: ✅ Complete - Code organization foundation in place
3. **Create core components**: ImageProcessor, FileUpload (prerequisites for their tests)
4. **TASK-008**: Error Boundary (production readiness)
5. **TASK-011** → **TASK-013**: Component and integration tests
6. **TASK-014**, **TASK-015**, **TASK-018**: Build and deployment configuration

---

## Technical Debt Notes

1. **Project scaffolded from scratch** - Previous plan assumed non-existent code
2. **No ESLint configured** - Lint command in package.json but eslint not installed
3. **No component library** - All UI components need to be created
4. **No integration tests** - API services exist but untested
5. **No deployment config** - Docker, GitHub Actions, Nginx configs needed

---

## Non-Goals (Per PROJECT_SPEC.md)

The following are explicitly **out of scope**:
- Backend API implementation (Spring Boot at port 8080)
- Additional file formats beyond those specified (PNG, JPEG, WebP, DDS)
- File size limits beyond 50MB (upscaling) or 5MB (simple upload)
- Mobile app development (web-only frontend)

---

*Generated: 2026-02-23*
*Last Updated: 2026-02-23 - Project scaffolded from scratch, TASK-005 and TASK-006 complete*
