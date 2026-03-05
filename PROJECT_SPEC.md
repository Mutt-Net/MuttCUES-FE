# Project Specification: MuttCUES-FE

## Project Name
**MuttCUES-FE** (MuttCUES Frontend)

## Description
MuttCUES-FE is a React-based frontend for the MuttCUES image processing platform. It provides a user interface for AI-powered image upscaling (using Real-ESRGAN via upscayl-ncnn) and DDS format conversion for game texture management. The application features drag-and-drop file uploads, real-time progress tracking, job status polling, and seamless integration with a Spring Boot backend API.

## Audience
- **Gamers and modders** who need to convert textures between DDS and PNG formats
- **Content creators** who want to upscale images using AI models
- **Developers** integrating with the MuttCUES image processing backend

## Jobs To Be Done (JTBD)
1. **Upscale images with AI** - Upload an image, select scale factor (2x/3x/4x) and model, then download the enhanced result
2. **Convert DDS textures** - Convert game texture files (DDS) to standard images (PNG) and vice versa
3. **Monitor processing jobs** - Track upload progress, processing status, and retrieve completed outputs

## Technical Constraints
- **Language**: TypeScript (strict mode)
- **Runtime**: Browser-based (React 18)
- **Build Tool**: Vite 7.x with @vitejs/plugin-react
- **Node Version**: 20.x (specified in Dockerfile)
- **API Contract**: RESTful API at `/api` proxied to `http://localhost:8080`
- **Max File Size**: 50MB for image processing, 5MB for simple uploads
- **Supported Formats**: PNG, JPEG, WebP for upscaling; DDS for texture conversion

## Build/Test Commands

### Development
```bash
npm run dev        # Start Vite dev server on port 5173
```

### Production
```bash
npm run build      # Build optimized bundle to ./dist
npm run preview    # Preview production build locally
```

### Docker
```bash
docker build -f Dockerfile.frontend -t muttcues-frontend .
```

### Testing
```bash
# Note: Test infrastructure uses Vitest but no test runner script in package.json
# Run tests directly with:
npx vitest run
```

### Linting
```bash
# No dedicated lint script configured
# Use TypeScript for type checking:
npx tsc --noEmit
```

## Architecture

### Frontend Stack
```
┌─────────────────────────────────────────────────────────┐
│                    Browser                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  React 18 (main.tsx → App.tsx)                  │   │
│  │  ├─ ImageProcessor (AI upscaling UI)            │   │
│  │  ├─ DdsConverter (DDS ↔ PNG conversion)         │   │
│  │  └─ FileUpload (basic upload/download)          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP /api/*
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Vite Dev Server (port 5173) or Nginx (production)     │
│  Proxy: /api → http://localhost:8080 (Spring Boot)     │
└─────────────────────────────────────────────────────────┘
```

### Source Structure
```
src/
├── main.tsx              # React entry point
├── App.tsx               # Root component
├── api/
│   ├── fileservice.ts    # File upload/download with progress
│   └── jobservice.ts     # Job submission, status polling, history
├── components/
│   ├── ImageProcessor.tsx    # AI upscaling interface
│   ├── DdsConverter.tsx      # DDS format converter
│   ├── DdsConverter.css      # Component styles
│   └── FileUpload.tsx        # Basic file operations
├── styles/
│   └── main.css          # Global styles
└── tests/
    └── app.test.tsx      # Vitest test suite
```

### Key Patterns
- **Functional Components** with React Hooks (useState, useEffect, useRef)
- **TypeScript interfaces** for API responses (JobStatus, JobStatistics)
- **XMLHttpRequest** for upload progress tracking (fetch lacks progress events)
- **Polling pattern** for job status (2-second intervals)
- **Drag-and-drop** file handling with validation
- **Module path aliases**: `@/*` resolves to `src/*`

### Deployment
- **Development**: Vite dev server with HMR
- **Production**: Multi-stage Docker build → Nginx serving static files
- **CI/CD**: GitHub Actions builds multi-arch images (amd64/arm64) to Docker Hub
