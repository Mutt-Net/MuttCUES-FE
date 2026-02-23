import React, { useState, useRef } from 'react'
import { uploadFile, listFiles, deleteFile, FileInfo } from '../api/fileservice'
import { validateFile, formatFileSize } from '../lib/fileValidation'
import './FileUpload.css'

interface FileUploadProps {
  acceptedTypes?: string[]
  maxSizeMB?: number
  onUploadComplete?: (file: FileInfo) => void
}

const FileUpload: React.FC<FileUploadProps> = ({
  acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'],
  maxSizeMB = 5,
  onUploadComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setSuccess('')
    setUploadProgress(0)

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Validate file type
      const typeResult = validateFile(file, {
        acceptedTypes,
        maxSizeMB
      })

      if (!typeResult.valid) {
        setError(typeResult.error || 'Invalid file type')
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    setUploadProgress(0)

    try {
      const response = await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      setSuccess(`File "${response.file.name}" uploaded successfully!`)
      setSelectedFile(null)
      setUploadProgress(0)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      if (onUploadComplete) {
        onUploadComplete(response.file)
      }

      // Refresh file list
      loadFiles()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(`Upload failed: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const loadFiles = async () => {
    setLoadingFiles(true)
    setError('')

    try {
      const response = await listFiles()
      setFiles(response.files)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files'
      setError(`Failed to load file list: ${errorMessage}`)
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleDelete = async (filename: string) => {
    setError('')
    setSuccess('')

    try {
      await deleteFile(filename)
      setSuccess(`File "${filename}" deleted successfully`)
      loadFiles()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file'
      setError(`Delete failed: ${errorMessage}`)
    }
  }

  const handleDownload = (file: FileInfo) => {
    if (file.url) {
      window.open(file.url, '_blank')
    } else {
      setError(`Download not available for "${file.name}": No URL provided`)
    }
  }

  React.useEffect(() => {
    loadFiles()
  }, [])

  return (
    <div className="file-upload">
      <div className="file-upload-header">
        <h2>File Upload</h2>
        <p className="subtitle">Upload and manage your files</p>
      </div>

      <div className="upload-section">
        <div className="file-input-wrapper">
          <label className="file-input-label">
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <div className="file-input-button">
              <span className="icon">📁</span>
              {selectedFile ? selectedFile.name : 'Choose File'}
            </div>
          </label>

          {selectedFile && (
            <div className="file-info">
              <div className="info-row">
                <span className="label">File:</span>
                <span className="value">{selectedFile.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Size:</span>
                <span className="value">{formatFileSize(selectedFile.size)}</span>
              </div>
              <div className="info-row">
                <span className="label">Type:</span>
                <span className="value">{selectedFile.type || 'Unknown'}</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span className="icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="icon">✅</span>
            {success}
          </div>
        )}

        {uploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}

        <div className="action-buttons">
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <span className="icon">⬆️</span>
                Upload
              </>
            )}
          </button>

          <button
            className="refresh-btn"
            onClick={loadFiles}
            disabled={loadingFiles || uploading}
          >
            <span className="icon">🔄</span>
            {loadingFiles ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="file-list-section">
        <h3>Uploaded Files</h3>

        {loadingFiles && !files.length ? (
          <div className="loading-state">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="empty-state">No files uploaded yet</div>
        ) : (
          <ul className="file-list">
            {files.map((file) => (
              <li key={file.name} className="file-item">
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <span className="file-type">{file.type}</span>
                  <span className="file-date">
                    Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="file-actions">
                  <button
                    className="download-action-btn"
                    onClick={() => handleDownload(file)}
                    title="Download file"
                  >
                    ⬇️
                  </button>
                  <button
                    className="delete-action-btn"
                    onClick={() => handleDelete(file.name)}
                    title="Delete file"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="upload-footer">
        <div className="info-card">
          <h4>Supported Formats</h4>
          <ul>
            {acceptedTypes.map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
        </div>

        <div className="info-card">
          <h4>File Size Limit</h4>
          <p>Maximum file size: {maxSizeMB}MB</p>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
