import React, { useState } from 'react'
import './DdsConverter.css'

interface ConversionResult {
  success: boolean
  fileId?: string
  fileName?: string
  downloadUrl?: string
  error?: string
}

const DdsConverter: React.FC = () => {
  const [operation, setOperation] = useState<'dds-to-png' | 'image-to-dds'>('dds-to-png')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Validate file type based on operation
      if (operation === 'dds-to-png' && !file.name.toLowerCase().endsWith('.dds')) {
        setError('Please select a DDS file')
        return
      }

      if (operation === 'image-to-dds') {
        const ext = file.name.toLowerCase()
        if (!ext.endsWith('.png') && !ext.endsWith('.jpg') && !ext.endsWith('.jpeg')) {
          setError('Please select a PNG or JPG file')
          return
        }
      }

      setSelectedFile(file)
      setError('')
      setResult(null)
    }
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    // Use /api base path (proxied to backend via Vite config)
    const endpoint =
      operation === 'dds-to-png'
        ? '/api/convert/dds-to-png'
        : '/api/convert/image-to-dds'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Conversion failed')
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (result && result.downloadUrl) {
      // Use /api base path for download URL
      window.open(result.downloadUrl, '_blank')
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setResult(null)
    setError('')
  }

  return (
    <div className="dds-converter">
      <div className="converter-header">
        <h2>DDS Format Converter</h2>
        <p className="subtitle">Convert between DDS and PNG formats</p>
      </div>

      <div className="operation-selector">
        <button
          className={`operation-btn ${operation === 'dds-to-png' ? 'active' : ''}`}
          onClick={() => {
            setOperation('dds-to-png')
            resetForm()
          }}
        >
          <span className="icon">📄 → 🖼️</span>
          <span className="label">DDS to PNG</span>
          <span className="description">Convert game textures to images</span>
        </button>

        <button
          className={`operation-btn ${operation === 'image-to-dds' ? 'active' : ''}`}
          onClick={() => {
            setOperation('image-to-dds')
            resetForm()
          }}
        >
          <span className="icon">🖼️ → 📄</span>
          <span className="label">Image to DDS</span>
          <span className="description">Convert images to game textures</span>
        </button>
      </div>

      <div className="converter-body">
        <div className="file-input-section">
          <label className="file-input-label">
            <input
              type="file"
              accept={operation === 'dds-to-png' ? '.dds' : '.png,.jpg,.jpeg'}
              onChange={handleFileSelect}
              disabled={loading}
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
                <span className="value">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
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

        {result && result.success && (
          <div className="success-message">
            <div className="success-header">
              <span className="icon">✅</span>
              <span>Conversion Successful!</span>
            </div>
            <div className="result-info">
              <div className="info-row">
                <span className="label">Output File:</span>
                <span className="value">{result.fileName}</span>
              </div>
            </div>
            <button className="download-btn" onClick={handleDownload}>
              <span className="icon">⬇️</span>
              Download Converted File
            </button>
          </div>
        )}

        <div className="action-buttons">
          <button
            className="convert-btn"
            onClick={handleConvert}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <span className="spinner">⏳</span>
                Converting...
              </>
            ) : (
              <>
                <span className="icon">🔄</span>
                Convert
              </>
            )}
          </button>

          {(selectedFile || result) && (
            <button className="reset-btn" onClick={resetForm} disabled={loading}>
              <span className="icon">🔄</span>
              New Conversion
            </button>
          )}
        </div>
      </div>

      <div className="converter-footer">
        <div className="info-card">
          <h4>About DDS Format</h4>
          <p>
            DDS (DirectDraw Surface) is a file format used for storing textures
            in video games and 3D applications. It supports various compression
            formats including DXT1, DXT3, and DXT5.
          </p>
        </div>

        <div className="info-card">
          <h4>Supported Formats</h4>
          <ul>
            <li>DDS to PNG: DXT1, DXT3, DXT5, Uncompressed ARGB</li>
            <li>Image to DDS: Creates uncompressed 32-bit ARGB DDS</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DdsConverter
