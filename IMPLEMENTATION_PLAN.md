# Implementation Plan

## Status
- **Total tasks**: 18
- **Completed**: 16
- **Remaining**: 2

---

## Summary

The MuttCUES-FE frontend is **substantially complete** with core functionality implemented:

### ✅ What's Working
- Image upscaling UI with drag-and-drop, file validation, progress tracking, and polling
- DDS converter UI with bidirectional conversion (DDS↔PNG)
- Simple file upload/download component
- API services for file operations and job management
- Docker deployment with multi-arch support
- GitHub Actions CI/CD pipeline
- TypeScript strict mode configuration
- **Vitest testing infrastructure with Testing Library**

### ⚠️ Gaps Identified
1. **No shared utility library** - `src/lib/` directory doesn't exist (per AGENTS.md conventions)
2. **Missing type exports** - Services define interfaces but don't export them centrally
3. **Inconsistent API base URL handling** - DDS converter uses hardcoded `http://localhost:8080` instead of `/api` proxy
4. **No error boundary** - React app lacks error boundary for graceful failures

---

## Tasks

### 🔧 Infrastructure & Testing (Priority 1)

- [x] **TASK-001**: Add Vitest and Testing Library to package.json
  - **Completed**: 2026-02-23
  - **Spec**: `PROJECT_SPEC.md` (Build/Test Commands section notes missing test runner)
  - **Required tests**: All existing tests in `src/tests/app.test.tsx` must pass
  - **Dependencies**: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@types/node`
  - **Notes**: Added `"test": "vitest run"` and `"test:watch": "vitest"` scripts. All 7 tests pass.

- [x] **TASK-002**: Create vitest.config.ts
  - **Completed**: 2026-02-23
  - **Spec**: Testing infrastructure
  - **Required tests**: Tests run successfully with `npm run test`
  - **Notes**: Configure test environment, globals, and setup file

- [x] **TASK-003**: Add test setup file for Testing Library
  - **Completed**: 2026-02-23
  - **Spec**: Testing best practices
  - **Required tests**: Custom matchers (e.g., `toBeInTheDocument`) available in all tests
  - **Notes**: Create `src/tests/setup.ts` with `@testing-library/jest-dom` extensions

- [x] **TASK-004**: Basic test suite exists
  - **Completed**: 2026-02-23
  - **Notes**: `src/tests/app.test.tsx` has 7 tests for ImageProcessor and JobService

### 📚 Code Organization (Priority 2)

- [ ] **TASK-005**: Create src/lib/ directory with shared utilities
  - **Spec**: `AGENTS.md` - "Treat `src/lib/` as the standard library"
  - **Required exports**:
    - File validation utilities (extract from `ImageProcessor.tsx` and `FileUpload.tsx`)
    - Format helpers (file size formatting, type checking)
    - Central type re-exports
  - **Notes**: Consolidate duplicate validation logic from multiple components

- [ ] **TASK-006**: Create centralized type exports
  - **Spec**: TypeScript best practices
  - **Required exports**: All interfaces from `jobservice.ts` and `fileservice.ts`
  - **Notes**: Create `src/api/index.ts` barrel export for clean imports

- [x] **TASK-007**: Fix DDS Converter API URL inconsistency
  - **Completed**: 2026-02-23
  - **Spec**: `PROJECT_SPEC.md` - API Contract: RESTful API at `/api` proxied to `http://localhost:8080`
  - **Required tests**: DDS converter works in both dev and production
  - **Notes**: Replace hardcoded `http://localhost:8080` with `/api` base path (see `DdsConverter.tsx` lines 62, 82)

### 🛡️ Error Handling & UX (Priority 3)

- [ ] **TASK-008**: Add React Error Boundary
  - **Spec**: Production readiness
  - **Required tests**: App gracefully handles component errors without crashing
  - **Notes**: Create `src/components/ErrorBoundary.tsx` wrapping the app

- [ ] **TASK-009**: Improve error messages in FileUpload component
  - **Spec**: User experience
  - **Required tests**: Users see actionable error messages
  - **Notes**: Replace generic "See console for details" with specific error messages

- [ ] **TASK-010**: Add loading states to DDS Converter
  - **Spec**: User experience
  - **Required tests**: UI shows spinner/loading state during conversion
  - **Notes**: Already has `loading` state but could improve visual feedback

### 🧪 Test Coverage (Priority 4)

- [ ] **TASK-011**: Add tests for FileUpload component
  - **Spec**: Testing coverage
  - **Required tests**: File validation, upload progress, download functionality
  - **Notes**: Currently untested

- [ ] **TASK-012**: Add tests for DdsConverter component
  - **Spec**: Testing coverage
  - **Required tests**: Operation switching, file validation, conversion flow
  - **Notes**: Currently untested

- [ ] **TASK-013**: Add integration tests for API services
  - **Spec**: `src/api/fileservice.ts`, `src/api/jobservice.ts`
  - **Required tests**: Mock server responses, error handling, progress callbacks
  - **Notes**: Partial coverage exists in `app.test.tsx`

### 📦 Build & Deployment (Priority 5)

- [x] **TASK-014**: Docker multi-stage build configured
  - **Completed**: 2026-02-23
  - **Notes**: `Dockerfile.frontend` builds and serves with Nginx

- [x] **TASK-015**: GitHub Actions CI/CD pipeline
  - **Completed**: 2026-02-23
  - **Notes**: `.github/workflows/docker-frontend.yml` handles build, push, scan, test

- [x] **TASK-016**: TypeScript strict mode enabled
  - **Completed**: 2026-02-23
  - **Notes**: `tsconfig.json` has `"strict": true`

- [x] **TASK-017**: Vite build configured with React plugin
  - **Completed**: 2026-02-23
  - **Notes**: `vite.config.ts` with proxy to backend

- [x] **TASK-018**: Nginx production configuration
  - **Completed**: 2026-02-23
  - **Notes**: `nginx.conf` handles SPA routing, API proxy, compression, security headers

---

## Recommended Implementation Order

1. **TASK-001** → **TASK-003**: Testing infrastructure (enables TDD for remaining work)
2. **TASK-007**: Fix DDS Converter API URL (critical bug - breaks in production)
3. **TASK-005** → **TASK-006**: Code organization (foundation for maintainability)
4. **TASK-008** → **TASK-010**: Error handling & UX improvements
5. **TASK-011** → **TASK-013**: Expand test coverage

---

## Technical Debt Notes

1. **Duplicate validation logic**: `validateFile` exists in both `ImageProcessor.tsx` and `FileUpload.tsx` with different constraints
2. **Hardcoded URLs**: `DdsConverter.tsx` bypasses Vite proxy with direct `localhost:8080` calls
3. **No component tests**: Only `ImageProcessor` has partial test coverage
4. **Inconsistent error handling**: Some components use `console.error`, others show user messages
5. **Broken import in App.tsx**: Fixed - was importing `../DdsConverter` instead of `./components/DdsConverter`

---

## Non-Goals (Per PROJECT_SPEC.md)

The following are explicitly **out of scope**:
- Backend API implementation (Spring Boot at port 8080)
- Additional file formats beyond those specified (PNG, JPEG, WebP, DDS)
- File size limits beyond 50MB (upscaling) or 5MB (simple upload)
- Mobile app development (web-only frontend)

---

*Generated: 2026-02-23*
