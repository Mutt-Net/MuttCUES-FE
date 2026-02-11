import React, { useState, useRef, DragEvent } from "react";
import { uploadFileWithProgress, downloadFile } from "../api/fileservice";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadStatus(`❌ ${error}`);
      setFile(null);
      return;
    }
    setFile(file);
    setUploadStatus("");
  };

  // Upload handler
  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadStatus("Uploading...");

    try {
      const uploadedFileId = await uploadFileWithProgress(file, (percent) => {
        setProgress(percent);
      });
      setFileId(uploadedFileId);
      setUploadStatus(`✅ Upload complete! File ID: ${uploadedFileId}`);
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Upload failed. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  // Download handler
  const handleDownload = async () => {
    if (!fileId.trim()) {
      alert("Please enter a File ID to download.");
      return;
    }

    try {
      const blob = await downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileId;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed. Check console for details.");
    }
  };

  // Drag & drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  return (
    <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #888",
          padding: "1rem",
          textAlign: "center",
          backgroundColor: dragOver ? "#eef" : "#fff",
          cursor: "pointer",
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {file ? file.name : "Drag & drop a file here or click to select"}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) handleFileSelect(selected);
        }}
        disabled={uploading}
      />

      {/* Upload button */}
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* Progress bar */}
      {progress > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <progress value={progress} max={100} style={{ flex: 1 }} />
          <span>{progress}%</span>
        </div>
      )}

      {/* Status */}
      {uploadStatus && <p>{uploadStatus}</p>}

      {/* Download */}
      <input
        type="text"
        placeholder="File ID"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
        disabled={uploading}
      />
      <button onClick={handleDownload} disabled={uploading || !fileId}>
        Download
      </button>
    </div>
  );
}
