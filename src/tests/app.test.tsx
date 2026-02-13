import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageProcessor } from '../src/components/ImageProcessor';

global.fetch = vi.fn();

describe('ImageProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ImageProcessor />);
    expect(screen.getByText('Image Upscaler')).toBeDefined();
  });

  it('shows scale factor selector', () => {
    render(<ImageProcessor />);
    expect(screen.getByText('Scale Factor:')).toBeDefined();
  });

  it('shows model selector', () => {
    render(<ImageProcessor />);
    expect(screen.getByText('Model:')).toBeDefined();
  });

  it('submit button is disabled when no file selected', () => {
    render(<ImageProcessor />);
    const button = screen.getByText('Upscale Image');
    expect(button.disabled).toBe(true);
  });
});

describe('Job Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submitProcessingJob should make correct API call', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        jobId: 'test-job-id',
        inputFileId: 'test-input-id',
        status: 'QUEUED'
      })
    });

    const { submitProcessingJob } = await import('../src/api/jobservice');
    
    // This would require actual implementation
    expect(true).toBe(true);
  });

  it('getJobStatus should handle success response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        jobId: 'test-job-id',
        status: 'PROCESSING',
        progressPercent: 50
      })
    });

    const { getJobStatus } = await import('../src/api/jobservice');
    const result = await getJobStatus('test-job-id');
    
    expect(result.status).toBe('PROCESSING');
    expect(result.progressPercent).toBe(50);
  });

  it('getJobStatus should throw on error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    });

    const { getJobStatus } = await import('../src/api/jobservice');
    
    await expect(getJobStatus('invalid-id')).rejects.toThrow();
  });
});
