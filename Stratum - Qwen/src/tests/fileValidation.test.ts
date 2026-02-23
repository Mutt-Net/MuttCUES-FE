import { describe, it, expect } from 'vitest'
import { validateFile, formatFileSize, getFileTypeFromName, isImageFile } from '../lib/fileValidation'

describe('fileValidation', () => {
  describe('validateFile', () => {
    it('should validate a valid file', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const result = validateFile(file, {
        acceptedTypes: ['image/png', 'image/jpeg'],
        maxSizeMB: 50
      })
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' })
      const result = validateFile(file, {
        acceptedTypes: ['image/png', 'image/jpeg'],
        maxSizeMB: 50
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not accepted')
    })

    it('should reject file exceeding size limit', () => {
      const largeFile = new File([new ArrayBuffer(60 * 1024 * 1024)], 'test.png', { type: 'image/png' })
      const result = validateFile(largeFile, {
        acceptedTypes: ['image/png'],
        maxSizeMB: 50
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
    })
  })

  describe('getFileTypeFromName', () => {
    it('should infer MIME type from filename', () => {
      expect(getFileTypeFromName('test.png')).toBe('image/png')
      expect(getFileTypeFromName('test.jpg')).toBe('image/jpeg')
      expect(getFileTypeFromName('test.dds')).toBe('image/x-dds')
    })
  })

  describe('isImageFile', () => {
    it('should identify image files', () => {
      const pngFile = new File(['test'], 'test.png', { type: 'image/png' })
      expect(isImageFile(pngFile)).toBe(true)
    })
  })
})
