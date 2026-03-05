import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DdsConverter from '../components/DdsConverter'

// Mock window.open
const mockOpen = vi.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen
})

// Mock fetch
global.fetch = vi.fn()

describe('DdsConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component title', () => {
    render(<DdsConverter />)
    expect(screen.getByText('DDS Format Converter')).toBeInTheDocument()
  })

  it('should render both operation buttons', () => {
    render(<DdsConverter />)
    expect(screen.getByText('DDS to PNG')).toBeInTheDocument()
    expect(screen.getByText('Image to DDS')).toBeInTheDocument()
  })

  it('should default to DDS to PNG operation', () => {
    render(<DdsConverter />)
    const ddsToPngBtn = screen.getByText('DDS to PNG').closest('button')
    const imageToDdsBtn = screen.getByText('Image to DDS').closest('button')
    expect(ddsToPngBtn).toHaveClass('active')
    expect(imageToDdsBtn).not.toHaveClass('active')
  })

  it('should switch operation when clicking the other button', () => {
    render(<DdsConverter />)
    const imageToDdsBtn = screen.getByText('Image to DDS').closest('button')
    fireEvent.click(imageToDdsBtn!)
    
    const ddsToPngBtn = screen.getByText('DDS to PNG').closest('button')
    const updatedImageToDdsBtn = screen.getByText('Image to DDS').closest('button')
    expect(ddsToPngBtn).not.toHaveClass('active')
    expect(updatedImageToDdsBtn).toHaveClass('active')
  })

  it('should show file validation error for wrong file type in DDS to PNG mode', () => {
    render(<DdsConverter />)
    
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    expect(screen.getByText('Please select a DDS file')).toBeInTheDocument()
  })

  it('should show file validation error for wrong file type in Image to DDS mode', () => {
    render(<DdsConverter />)
    
    // Switch to Image to DDS mode
    const imageToDdsBtn = screen.getByText('Image to DDS').closest('button')
    fireEvent.click(imageToDdsBtn!)
    
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['test'], 'test.gif', { type: 'image/gif' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    expect(screen.getByText('Please select a PNG or JPG file')).toBeInTheDocument()
  })

  it('should accept valid DDS file in DDS to PNG mode', () => {
    const { container } = render(<DdsConverter />)
    
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['dds content'], 'texture.dds', { type: 'image/x-dds' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    expect(screen.queryByText('Please select a DDS file')).not.toBeInTheDocument()
    // File name appears in file-info section - check for the file info container
    const fileInfoSection = container.querySelector('.file-info')
    expect(fileInfoSection).toBeInTheDocument()
  })

  it('should accept valid PNG file in Image to DDS mode', () => {
    const { container } = render(<DdsConverter />)
    
    // Switch to Image to DDS mode
    const imageToDdsBtn = screen.getByText('Image to DDS').closest('button')
    fireEvent.click(imageToDdsBtn!)
    
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['png content'], 'image.png', { type: 'image/png' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    expect(screen.queryByText('Please select a PNG or JPG file')).not.toBeInTheDocument()
    // File name appears in file-info section - check for the file info container
    const fileInfoSection = container.querySelector('.file-info')
    expect(fileInfoSection).toBeInTheDocument()
  })

  it('should show error when convert is clicked without file', () => {
    render(<DdsConverter />)
    
    const convertBtn = screen.getByText('Convert')
    // Button should be disabled when no file is selected
    expect(convertBtn).toBeDisabled()
  })

  it('should call API with correct endpoint for DDS to PNG conversion', async () => {
    const mockResponse = { success: true, fileName: 'texture.png', downloadUrl: '/api/files/texture.png/download' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    render(<DdsConverter />)
    
    // Select file
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['dds content'], 'texture.dds', { type: 'image/x-dds' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Click convert
    const convertBtn = screen.getByText('Convert')
    fireEvent.click(convertBtn)
    
    // Check loading state
    expect(screen.getByText('Converting...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/convert/dds-to-png', {
        method: 'POST',
        body: expect.any(FormData)
      })
    })
  })

  it('should call API with correct endpoint for Image to DDS conversion', async () => {
    const mockResponse = { success: true, fileName: 'image.dds', downloadUrl: '/api/files/image.dds/download' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    render(<DdsConverter />)
    
    // Switch to Image to DDS mode
    const imageToDdsBtn = screen.getByText('Image to DDS').closest('button')
    fireEvent.click(imageToDdsBtn!)
    
    // Select file
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['png content'], 'image.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Click convert
    const convertBtn = screen.getByText('Convert')
    fireEvent.click(convertBtn)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/convert/image-to-dds', {
        method: 'POST',
        body: expect.any(FormData)
      })
    })
  })

  it('should show success message after successful conversion', async () => {
    const mockResponse = { success: true, fileName: 'texture.png', downloadUrl: '/api/files/texture.png/download' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    render(<DdsConverter />)
    
    // Select file
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['dds content'], 'texture.dds', { type: 'image/x-dds' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Click convert
    const convertBtn = screen.getByText('Convert')
    fireEvent.click(convertBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Conversion Successful!')).toBeInTheDocument()
      expect(screen.getByText('texture.png')).toBeInTheDocument()
    })
  })

  it('should show error message after failed conversion', async () => {
    const mockResponse = { success: false, error: 'Invalid DDS format' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    render(<DdsConverter />)
    
    // Select file
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['dds content'], 'texture.dds', { type: 'image/x-dds' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Click convert
    const convertBtn = screen.getByText('Convert')
    fireEvent.click(convertBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid DDS format')).toBeInTheDocument()
    })
  })

  it('should call window.open with download URL when download button is clicked', async () => {
    const mockResponse = { success: true, fileName: 'texture.png', downloadUrl: '/api/files/texture.png/download' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    render(<DdsConverter />)
    
    // Select file
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['dds content'], 'texture.dds', { type: 'image/x-dds' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Click convert
    const convertBtn = screen.getByText('Convert')
    fireEvent.click(convertBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Download Converted File')).toBeInTheDocument()
    })
    
    // Click download
    const downloadBtn = screen.getByText('Download Converted File')
    fireEvent.click(downloadBtn)
    
    expect(mockOpen).toHaveBeenCalledWith('/api/files/texture.png/download', '_blank')
  })

  it('should reset form when New Conversion button is clicked', async () => {
    const mockResponse = { success: true, fileName: 'texture.png', downloadUrl: '/api/files/texture.png/download' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    render(<DdsConverter />)
    
    // Select file
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['dds content'], 'texture.dds', { type: 'image/x-dds' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Click convert
    const convertBtn = screen.getByText('Convert')
    fireEvent.click(convertBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Conversion Successful!')).toBeInTheDocument()
    })
    
    // Click reset
    const resetBtn = screen.getByText('New Conversion')
    fireEvent.click(resetBtn)
    
    expect(screen.queryByText('texture.dds')).not.toBeInTheDocument()
    expect(screen.queryByText('Conversion Successful!')).not.toBeInTheDocument()
    expect(fileInput.value).toBe('')
  })

  it('should show loading state during conversion', async () => {
    // Create a promise that doesn't resolve immediately
    let resolvePromise: (value: Response) => void
    const promise = new Promise<Response>((resolve) => {
      resolvePromise = resolve
    })
    
    vi.mocked(fetch).mockReturnValueOnce(promise)

    render(<DdsConverter />)
    
    // Select file
    const fileInput = screen.getByLabelText(/choose file/i) as HTMLInputElement
    const file = new File(['dds content'], 'texture.dds', { type: 'image/x-dds' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Click convert
    const convertBtn = screen.getByText('Convert')
    fireEvent.click(convertBtn)
    
    // Check loading state is shown
    await waitFor(() => {
      expect(screen.getByText('Converting...')).toBeInTheDocument()
      expect(convertBtn).toBeDisabled()
    })
    
    // Resolve the promise to clean up
    resolvePromise!({
      ok: true,
      json: async () => ({ success: true, fileName: 'texture.png' })
    } as Response)
  })
})
