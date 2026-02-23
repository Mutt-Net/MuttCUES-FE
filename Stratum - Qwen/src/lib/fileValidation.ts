/**
 * File validation utilities
 * Centralized validation logic for file operations
 */

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export interface FileValidationOptions {
  acceptedTypes: string[]
  maxSizeMB: number
}

/**
 * Validates a file against type and size constraints
 */
export function validateFile(
  file: File,
  options: FileValidationOptions
): FileValidationResult {
  const { acceptedTypes, maxSizeMB } = options

  // Check file type
  const fileType = file.type || getFileTypeFromName(file.name)
  if (!acceptedTypes.includes(fileType)) {
    return {
      valid: false,
      error: `File type "${fileType}" is not accepted. Accepted types: ${acceptedTypes.join(', ')}`
    }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

/**
 * Infers MIME type from file extension
 */
export function getFileTypeFromName(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    dds: 'image/x-dds'
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Checks if a file is an image
 */
export function isImageFile(file: File): boolean {
  const type = file.type || getFileTypeFromName(file.name)
  return type.startsWith('image/')
}

/**
 * Checks if a file is a DDS file
 */
export function isDdsFile(file: File): boolean {
  const type = file.type || getFileTypeFromName(file.name)
  return type === 'image/x-dds' || file.name.toLowerCase().endsWith('.dds')
}

/**
 * Validates image dimensions
 */
export async function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<FileValidationResult> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      if (minWidth && img.width < minWidth) {
        resolve({
          valid: false,
          error: `Image width (${img.width}px) must be at least ${minWidth}px`
        })
        return
      }

      if (minHeight && img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image height (${img.height}px) must be at least ${minHeight}px`
        })
        return
      }

      if (maxWidth && img.width > maxWidth) {
        resolve({
          valid: false,
          error: `Image width (${img.width}px) must not exceed ${maxWidth}px`
        })
        return
      }

      if (maxHeight && img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Image height (${img.height}px) must not exceed ${maxHeight}px`
        })
        return
      }

      resolve({ valid: true })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        error: 'Failed to load image'
      })
    }

    img.src = url
  })
}
