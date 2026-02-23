/**
 * File Service - Manages file operations
 */

export interface FileInfo {
  name: string
  size: number
  type: string
  uploadedAt: string
  url?: string
}

export interface UploadFileResponse {
  file: FileInfo
}

export interface ListFilesResponse {
  files: FileInfo[]
}

/**
 * Uploads a file to the server
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadFileResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const xhr = new XMLHttpRequest()
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100)
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch (_e) {
          reject(new Error('Invalid response from server'))
        }
      } else {
        reject(new Error(xhr.responseText || 'Upload failed'))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.open('POST', '/api/files/upload')
    xhr.send(formData)
  })
}

/**
 * Lists all uploaded files
 */
export async function listFiles(): Promise<ListFilesResponse> {
  const response = await fetch('/api/files')

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to list files: ${error}`)
  }

  return response.json()
}

/**
 * Deletes a file from the server
 */
export async function deleteFile(filename: string): Promise<void> {
  const response = await fetch(`/api/files/${filename}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete file: ${error}`)
  }
}
