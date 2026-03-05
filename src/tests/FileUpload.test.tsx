import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import FileUpload from '../components/FileUpload'
import * as fileService from '../api/fileservice'

// Mock window.open
const mockOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen
})

// Mock uploadFile
vi.mock('../api/fileservice', async () => {
  const actual = await vi.importActual('../api/fileservice')
  return {
    ...actual,
    uploadFile: vi.fn(),
    listFiles: vi.fn(),
    deleteFile: vi.fn()
  }
})

describe('FileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock listFiles to return empty list by default
    vi.mocked(fileService.listFiles).mockResolvedValue({ files: [] })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component title', async () => {
    await act(async () => {
      render(<FileUpload />)
    })
    expect(screen.getByText('File Upload')).toBeInTheDocument()
  })

  it('should render file input button', async () => {
    await act(async () => {
      render(<FileUpload />)
    })
    expect(screen.getByText('Choose File')).toBeInTheDocument()
  })

  it('should show file info after selecting a valid file', async () => {
    await act(async () => {
      render(<FileUpload />)
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    // File name appears in file-info section
    const fileInfoSection = screen.getByText('File:').closest('.file-info')
    expect(fileInfoSection).toBeInTheDocument()
    expect(screen.getByText('12 Bytes')).toBeInTheDocument()
  })

  it('should show error for invalid file type', async () => {
    await act(async () => {
      render(<FileUpload />)
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test'], 'test.gif', { type: 'image/gif' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    expect(screen.getByText(/File type.*is not accepted/)).toBeInTheDocument()
  })

  it('should show error for file exceeding size limit', async () => {
    await act(async () => {
      render(<FileUpload maxSizeMB={1} />)
    })

    const largeFile = new File([new Array(2 * 1024 * 1024).fill('x').join('')], 'large.png', {
      type: 'image/png'
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [largeFile] } })
    })

    expect(screen.getByText(/exceeds maximum allowed size/)).toBeInTheDocument()
  })

  it('should call uploadFile with correct parameters', async () => {
    const mockUploadResponse = {
      file: {
        name: 'test.png',
        size: 1024,
        type: 'image/png',
        uploadedAt: '2026-02-23T00:00:00Z',
        url: '/api/files/test.png/download'
      }
    }

    vi.mocked(fileService.uploadFile).mockImplementation(async (_file, onProgress) => {
      if (onProgress) {
        onProgress(50)
        onProgress(100)
      }
      return mockUploadResponse
    })

    await act(async () => {
      render(<FileUpload />)
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    const uploadBtn = screen.getByText('Upload')

    await act(async () => {
      fireEvent.click(uploadBtn)
    })

    await waitFor(() => {
      expect(fileService.uploadFile).toHaveBeenCalledWith(
        expect.any(File),
        expect.any(Function)
      )
    })
  })

  it('should show progress bar during upload', async () => {
    // Create a promise we can control for timing
    let resolveUpload: (value: { file: any }) => void
    const uploadPromise = new Promise<{ file: any }>((resolve) => {
      resolveUpload = resolve
    })

    vi.mocked(fileService.uploadFile).mockImplementation(async (_file, onProgress) => {
      // Call progress synchronously
      if (onProgress) {
        onProgress(50)
      }
      // Return promise that resolves later
      return uploadPromise
    })

    await act(async () => {
      render(<FileUpload />)
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    const uploadBtn = screen.getByText('Upload')

    await act(async () => {
      fireEvent.click(uploadBtn)
    })

    // Progress bar should be visible immediately since progress is called synchronously
    expect(screen.getByText('50%')).toBeInTheDocument()

    // Clean up - resolve the promise
    resolveUpload!({ file: { name: 'test.png', size: 1024, type: 'image/png', uploadedAt: '2026-02-23T00:00:00Z' } })
  })

  it('should show success message after successful upload', async () => {
    vi.mocked(fileService.uploadFile).mockResolvedValue({
      file: {
        name: 'test.png',
        size: 1024,
        type: 'image/png',
        uploadedAt: '2026-02-23T00:00:00Z',
        url: '/api/files/test.png/download'
      }
    })

    vi.mocked(fileService.listFiles).mockResolvedValue({ files: [] })

    await act(async () => {
      render(<FileUpload />)
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    const uploadBtn = screen.getByText('Upload')

    await act(async () => {
      fireEvent.click(uploadBtn)
    })

    await waitFor(() => {
      expect(screen.getByText(/uploaded successfully/)).toBeInTheDocument()
    })
  })

  it('should show error message after failed upload', async () => {
    vi.mocked(fileService.uploadFile).mockRejectedValue(new Error('Network error'))

    await act(async () => {
      render(<FileUpload />)
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    const uploadBtn = screen.getByText('Upload')

    await act(async () => {
      fireEvent.click(uploadBtn)
    })

    await waitFor(() => {
      expect(screen.getByText(/Upload failed: Network error/)).toBeInTheDocument()
    })
  })

  it('should call listFiles on mount', async () => {
    await act(async () => {
      render(<FileUpload />)
    })

    expect(fileService.listFiles).toHaveBeenCalled()
  })

  it('should display file list from server', async () => {
    const mockFiles = [
      {
        name: 'file1.png',
        size: 2048,
        type: 'image/png',
        uploadedAt: '2026-02-23T00:00:00Z',
        url: '/api/files/file1.png/download'
      },
      {
        name: 'file2.jpg',
        size: 4096,
        type: 'image/jpeg',
        uploadedAt: '2026-02-22T00:00:00Z',
        url: '/api/files/file2.jpg/download'
      }
    ]

    vi.mocked(fileService.listFiles).mockResolvedValue({ files: mockFiles })

    await act(async () => {
      render(<FileUpload />)
    })

    await waitFor(() => {
      expect(screen.getByText('file1.png')).toBeInTheDocument()
      expect(screen.getByText('file2.jpg')).toBeInTheDocument()
    })
  })

  it('should call deleteFile when delete button is clicked', async () => {
    const mockFiles = [
      {
        name: 'file1.png',
        size: 2048,
        type: 'image/png',
        uploadedAt: '2026-02-23T00:00:00Z',
        url: '/api/files/file1.png/download'
      }
    ]

    vi.mocked(fileService.listFiles).mockResolvedValue({ files: mockFiles })
    vi.mocked(fileService.deleteFile).mockResolvedValue()

    await act(async () => {
      render(<FileUpload />)
    })

    await waitFor(() => {
      expect(screen.getByText('file1.png')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByTitle('Delete file')

    await act(async () => {
      fireEvent.click(deleteBtn)
    })

    await waitFor(() => {
      expect(fileService.deleteFile).toHaveBeenCalledWith('file1.png')
    })
  })

  it('should show success message after successful delete', async () => {
    const mockFiles = [
      {
        name: 'file1.png',
        size: 2048,
        type: 'image/png',
        uploadedAt: '2026-02-23T00:00:00Z',
        url: '/api/files/file1.png/download'
      }
    ]

    vi.mocked(fileService.listFiles).mockResolvedValue({ files: mockFiles })
    vi.mocked(fileService.deleteFile).mockResolvedValue()

    await act(async () => {
      render(<FileUpload />)
    })

    await waitFor(() => {
      expect(screen.getByText('file1.png')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByTitle('Delete file')

    await act(async () => {
      fireEvent.click(deleteBtn)
    })

    await waitFor(() => {
      expect(screen.getByText(/deleted successfully/)).toBeInTheDocument()
    })
  })

  it('should call window.open when download button is clicked', async () => {
    const mockFiles = [
      {
        name: 'file1.png',
        size: 2048,
        type: 'image/png',
        uploadedAt: '2026-02-23T00:00:00Z',
        url: '/api/files/file1.png/download'
      }
    ]

    vi.mocked(fileService.listFiles).mockResolvedValue({ files: mockFiles })

    await act(async () => {
      render(<FileUpload />)
    })

    await waitFor(() => {
      expect(screen.getByText('file1.png')).toBeInTheDocument()
    })

    const downloadBtn = screen.getByTitle('Download file')

    await act(async () => {
      fireEvent.click(downloadBtn)
    })

    expect(mockOpen).toHaveBeenCalledWith('/api/files/file1.png/download', '_blank')
  })

  it('should refresh file list when refresh button is clicked', async () => {
    vi.mocked(fileService.listFiles)
      .mockResolvedValueOnce({ files: [] })
      .mockResolvedValueOnce({
        files: [
          {
            name: 'newfile.png',
            size: 1024,
            type: 'image/png',
            uploadedAt: '2026-02-23T00:00:00Z',
            url: '/api/files/newfile.png/download'
          }
        ]
      })

    await act(async () => {
      render(<FileUpload />)
    })

    const refreshBtn = screen.getByText('Refresh')

    await act(async () => {
      fireEvent.click(refreshBtn)
    })

    await waitFor(() => {
      expect(screen.getByText('newfile.png')).toBeInTheDocument()
    })
  })

  it('should show empty state when no files are uploaded', async () => {
    vi.mocked(fileService.listFiles).mockResolvedValue({ files: [] })

    await act(async () => {
      render(<FileUpload />)
    })

    await waitFor(() => {
      expect(screen.getByText('No files uploaded yet')).toBeInTheDocument()
    })
  })

  it('should disable upload button when no file is selected', async () => {
    await act(async () => {
      render(<FileUpload />)
    })

    const uploadBtn = screen.getByText('Upload')
    expect(uploadBtn).toBeDisabled()
  })

  it('should enable upload button when file is selected', async () => {
    await act(async () => {
      render(<FileUpload />)
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    const uploadBtn = screen.getByText('Upload')
    expect(uploadBtn).not.toBeDisabled()
  })

  it('should clear selected file after successful upload', async () => {
    vi.mocked(fileService.uploadFile).mockResolvedValue({
      file: {
        name: 'test.png',
        size: 1024,
        type: 'image/png',
        uploadedAt: '2026-02-23T00:00:00Z',
        url: '/api/files/test.png/download'
      }
    })

    await act(async () => {
      render(<FileUpload />)
    })

    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    // File info section should be visible
    expect(screen.getByText('File:')).toBeInTheDocument()

    const uploadBtn = screen.getByText('Upload')

    await act(async () => {
      fireEvent.click(uploadBtn)
    })

    // After upload, file info section should be cleared
    await waitFor(() => {
      expect(screen.queryByText('File:')).not.toBeInTheDocument()
    })
  })
})
