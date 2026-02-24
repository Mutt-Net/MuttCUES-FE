import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, 'src/tests/setup.ts'),
    css: false, // Disable CSS processing for memory efficiency
    clearMocks: true, // Clear mocks between tests
    restoreMocks: true, // Restore mocks between tests
    unstubGlobals: true, // Unstub globals between tests
    fileParallelism: false, // Don't run test files in parallel
    isolate: true, // Isolate tests between files
  },
})
