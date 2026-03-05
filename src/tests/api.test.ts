/**
 * API Services Integration Tests
 * Tests for fileservice.ts and jobservice.ts with mocked server responses
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  uploadFile,
  listFiles,
  deleteFile,
  type UploadFileResponse,
  type ListFilesResponse
} from '../api/fileservice'
import {
  createJob,
  getJobStatus,
  pollJob,
  downloadFile,
  type Job,
  type CreateJobRequest
} from '../api/jobservice'

// Mock XMLHttpRequest for uploadFile
const mockXHR = {
  open: vi.fn(),
  send: vi.fn(),
  upload: { addEventListener: vi.fn() },
  addEventListener: vi.fn(),
  status: 200,
  responseText: '{}',
  setRequestHeader: vi.fn()
}

beforeEach(() => {
  vi.stubGlobal('XMLHttpRequest', function () {
    return mockXHR
  })
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('FileService', () => {
  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      const mockResponse: UploadFileResponse = {
        file: {
          name: 'test.png',
          size: 12,
          type: 'image/png',
          uploadedAt: '2026-02-23T00:00:00Z'
        }
      }

      mockXHR.responseText = JSON.stringify(mockResponse)
      mockXHR.status = 200

      // Simulate async load
      setTimeout(() => {
        const loadEvent = { target: mockXHR } as unknown as Event
        const loadListener = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1] as EventListener
        if (loadListener) {
          loadListener.call(mockXHR, loadEvent)
        }
      }, 0)

      const result = await uploadFile(mockFile)
      
      expect(result).toEqual(mockResponse)
      expect(mockXHR.open).toHaveBeenCalledWith('POST', '/api/files/upload')
      expect(mockXHR.send).toHaveBeenCalled()
    })

    it('should report upload progress', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      const progressCallback = vi.fn()

      mockXHR.responseText = JSON.stringify({ file: { name: 'test.png', size: 12, type: 'image/png', uploadedAt: '2026-02-23T00:00:00Z' } })
      mockXHR.status = 200

      // Capture progress listener
      let progressListener: EventListener | null = null
      mockXHR.upload.addEventListener.mockImplementation((event: string, listener: EventListener) => {
        if (event === 'progress') {
          progressListener = listener
        }
      })

      // Simulate load listener
      setTimeout(() => {
        const loadEvent = { target: mockXHR } as unknown as Event
        const loadListener = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1] as EventListener
        if (loadListener) {
          loadListener.call(mockXHR, loadEvent)
        }
      }, 10)

      const result = uploadFile(mockFile, progressCallback)

      // Simulate progress event
      if (progressListener) {
        (progressListener as EventListener).call(mockXHR.upload, {
          lengthComputable: true,
          loaded: 50,
          total: 100
        } as unknown as ProgressEvent)
      }

      await result

      expect(progressCallback).toHaveBeenCalledWith(50)
    })

    it('should reject on upload error', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      
      mockXHR.status = 500
      mockXHR.responseText = 'Internal Server Error'

      setTimeout(() => {
        const loadEvent = { target: mockXHR } as unknown as Event
        const loadListener = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1] as EventListener
        if (loadListener) {
          loadListener.call(mockXHR, loadEvent)
        }
      }, 0)

      await expect(uploadFile(mockFile)).rejects.toThrow('Internal Server Error')
    })

    it('should reject on network error', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })

      setTimeout(() => {
        const errorListener = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'error'
        )?.[1] as EventListener
        if (errorListener) {
          errorListener.call(mockXHR, {} as Event)
        }
      }, 0)

      await expect(uploadFile(mockFile)).rejects.toThrow('Network error during upload')
    })

    it('should reject on invalid JSON response', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' })
      
      mockXHR.responseText = 'invalid json'
      mockXHR.status = 200

      setTimeout(() => {
        const loadEvent = { target: mockXHR } as unknown as Event
        const loadListener = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1] as EventListener
        if (loadListener) {
          loadListener.call(mockXHR, loadEvent)
        }
      }, 0)

      await expect(uploadFile(mockFile)).rejects.toThrow('Invalid response from server')
    })
  })

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      const mockFiles: ListFilesResponse = {
        files: [
          { name: 'test1.png', size: 1024, type: 'image/png', uploadedAt: '2026-02-23T00:00:00Z' },
          { name: 'test2.jpg', size: 2048, type: 'image/jpeg', uploadedAt: '2026-02-23T00:01:00Z' }
        ]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFiles)
      })

      const result = await listFiles()
      
      expect(result).toEqual(mockFiles)
      expect(global.fetch).toHaveBeenCalledWith('/api/files')
    })

    it('should reject when listing files fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Server error')
      })

      await expect(listFiles()).rejects.toThrow('Failed to list files: Server error')
    })
  })

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true
      })

      await deleteFile('test.png')
      
      expect(global.fetch).toHaveBeenCalledWith('/api/files/test.png', { method: 'DELETE' })
    })

    it('should reject when deletion fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('File not found')
      })

      await expect(deleteFile('nonexistent.png')).rejects.toThrow('Failed to delete file: File not found')
    })
  })
})

describe('JobService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('createJob', () => {
    it('should create a job successfully', async () => {
      const mockRequest: CreateJobRequest = {
        type: 'upscale',
        inputFile: 'test.png',
        parameters: { scale: 2 }
      }

      const mockJob: Job = {
        id: 'job-123',
        status: 'pending',
        type: 'upscale',
        createdAt: '2026-02-23T00:00:00Z'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job: mockJob })
      })

      const result = await createJob(mockRequest)
      
      expect(result).toEqual({ job: mockJob })
      expect(global.fetch).toHaveBeenCalledWith('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockRequest)
      })
    })

    it('should reject when job creation fails', async () => {
      const mockRequest: CreateJobRequest = {
        type: 'upscale',
        inputFile: 'test.png'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Invalid job type')
      })

      await expect(createJob(mockRequest)).rejects.toThrow('Failed to create job: Invalid job type')
    })
  })

  describe('getJobStatus', () => {
    it('should get job status successfully', async () => {
      const mockJob: Job = {
        id: 'job-123',
        status: 'processing',
        type: 'upscale',
        createdAt: '2026-02-23T00:00:00Z',
        progress: 50
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job: mockJob })
      })

      const result = await getJobStatus('job-123')
      
      expect(result).toEqual({ job: mockJob })
      expect(global.fetch).toHaveBeenCalledWith('/api/jobs/job-123')
    })

    it('should reject when status check fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Job not found')
      })

      await expect(getJobStatus('nonexistent')).rejects.toThrow('Failed to get job status: Job not found')
    })
  })

  describe('pollJob', () => {
    it('should poll until job completes', async () => {
      const pendingJob: Job = {
        id: 'job-123',
        status: 'pending',
        type: 'upscale',
        createdAt: '2026-02-23T00:00:00Z'
      }

      const processingJob: Job = {
        ...pendingJob,
        status: 'processing',
        progress: 50
      }

      const completedJob: Job = {
        ...pendingJob,
        status: 'completed',
        progress: 100,
        completedAt: '2026-02-23T00:01:00Z'
      }

      const responses = [
        { job: pendingJob },
        { job: processingJob },
        { job: completedJob }
      ]

      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        const response = responses[callCount++] || responses[responses.length - 1]
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response)
        })
      })

      const pollPromise = pollJob('job-123', undefined, 100, 5000)

      // Advance timers to trigger polling
      await vi.advanceTimersByTimeAsync(300)

      const result = await pollPromise
      
      expect(result).toEqual(completedJob)
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('should call progress callback during polling', async () => {
      const processingJob: Job = {
        id: 'job-123',
        status: 'processing',
        type: 'upscale',
        createdAt: '2026-02-23T00:00:00Z',
        progress: 50
      }

      const completedJob: Job = {
        ...processingJob,
        status: 'completed',
        progress: 100
      }

      const responses = [{ job: processingJob }, { job: completedJob }]
      let callCount = 0

      global.fetch = vi.fn().mockImplementation(() => {
        const response = responses[callCount++] || responses[responses.length - 1]
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response)
        })
      })

      const progressCallback = vi.fn()
      const pollPromise = pollJob('job-123', progressCallback, 100, 5000)

      await vi.advanceTimersByTimeAsync(200)
      await pollPromise

      expect(progressCallback).toHaveBeenCalledWith(50)
      expect(progressCallback).toHaveBeenCalledWith(100)
    })

    it('should reject when job fails', async () => {
      const failedJob: Job = {
        id: 'job-123',
        status: 'failed',
        type: 'upscale',
        createdAt: '2026-02-23T00:00:00Z',
        error: 'Processing error'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job: failedJob })
      })

      await expect(pollJob('job-123', undefined, 100, 5000)).rejects.toThrow('Processing error')
    })

    it('should reject on timeout', async () => {
      const processingJob: Job = {
        id: 'job-123',
        status: 'processing',
        type: 'upscale',
        createdAt: '2026-02-23T00:00:00Z',
        progress: 50
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job: processingJob })
      })

      // Use real timers for timeout test since pollJob uses Date.now()
      vi.useRealTimers()
      
      await expect(pollJob('job-123', undefined, 50, 100)).rejects.toThrow('Job polling timed out')
      
      // Restore fake timers
      vi.useFakeTimers()
    })
  })

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      const mockBlob = new Blob(['file content'], { type: 'image/png' })

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      })

      const result = await downloadFile('test.png')
      
      expect(result).toEqual(mockBlob)
      expect(global.fetch).toHaveBeenCalledWith('/api/files/test.png/download')
    })

    it('should reject when download fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('File not found')
      })

      await expect(downloadFile('nonexistent.png')).rejects.toThrow('Failed to download file: File not found')
    })
  })
})
