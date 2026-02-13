import React, { useState, useEffect, useRef, DragEvent } from "react";
import { submitProcessingJob, getJobStatus, downloadFile, JobStatus } from "../api/jobservice";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const MODELS = [
  { value: "ultramix_balanced", label: "UltraMix Balanced (2x/4x)" },
  { value: "realesrgan-x4plus", label: "RealESRGAN x4+ (4x)" },
  { value: "realcugan", label: "RealCUGAN (2x/3x/4x)" },
  { value: "realesrgan-x2", label: "RealESRGAN x2 (2x)" },
];

const SCALE_OPTIONS = [2, 3, 4];

export function ImageProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState("");
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [scaleFactor, setScaleFactor] = useState(2);
  const [modelName, setModelName] = useState("ultramix_balanced");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [downloadingOutput, setDownloadingOutput] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const pollIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (jobId && jobStatus && (jobStatus.status === "QUEUED" || jobStatus.status === "PROCESSING")) {
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);
          setJobStatus(status);
          setProgress(status.progressPercent || 0);
          
          if (status.status === "COMPLETED") {
            setStatus("✅ Processing complete!");
            setProcessing(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
          } else if (status.status === "FAILED") {
            setStatus(`❌ Processing failed: ${status.errorMessage}`);
            setProcessing(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
          } else {
            setStatus(`Status: ${status.status} (${status.progressPercent}%)`);
          }
        } catch (err) {
          console.error("Failed to poll job status", err);
        }
      }, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [jobId, jobStatus?.status]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Allowed: PNG, JPEG, WebP`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large: ${(file.size / 1024 / 1024).toFixed(2)} MB (max 50 MB)`;
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setStatus(`❌ ${error}`);
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setStatus("");
    setJobId("");
    setJobStatus(null);
    
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleSubmit = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    setUploading(true);
    setProcessing(true);
    setProgress(0);
    setStatus("Uploading and starting processing...");

    try {
      const response = await submitProcessingJob(file, scaleFactor, modelName, (percent) => {
        setProgress(Math.round(percent * 0.5));
      });
      
      setJobId(response.jobId);
      setStatus(`Processing started (Job: ${response.jobId.substring(0, 8)}...)`);
    } catch (err) {
      console.error(err);
      setStatus(`❌ Failed to start processing: ${err}`);
      setProcessing(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!jobStatus?.outputFileId) {
      setStatus("No output file available yet.");
      return;
    }

    setDownloadingOutput(true);
    try {
      const blob = await downloadFile(jobStatus.outputFileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `upscaled_${file?.name || "image.png"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("✅ Download started!");
    } catch (err) {
      console.error(err);
      setStatus(`❌ Download failed: ${err}`);
    } finally {
      setDownloadingOutput(false);
    }
  };

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

  const formatTime = (ms: number | null): string => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
      <h2>Image Upscaler</h2>
      
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #888",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: dragOver ? "#eef" : "#fafafa",
          cursor: "pointer",
          borderRadius: "8px",
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "4px" }} />
        ) : (
          <p>{file ? file.name : "Drag & drop an image here or click to select"}</p>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept={ALLOWED_TYPES.join(",")}
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) handleFileSelect(selected);
        }}
        disabled={uploading || processing}
      />

      {/* Options */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Scale Factor:</label>
          <select 
            value={scaleFactor} 
            onChange={(e) => setScaleFactor(Number(e.target.value))}
            disabled={processing}
          >
            {SCALE_OPTIONS.map(s => <option key={s} value={s}>{s}x</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Model:</label>
          <select 
            value={modelName} 
            onChange={(e) => setModelName(e.target.value)}
            disabled={processing}
          >
            {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        onClick={handleSubmit} 
        disabled={!file || uploading || processing}
        style={{ padding: "0.75rem", fontSize: "1rem", cursor: "pointer" }}
      >
        {uploading ? "Uploading..." : processing ? "Processing..." : "Upscale Image"}
      </button>

      {/* Progress */}
      {(uploading || processing) && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <progress value={progress} max={100} style={{ flex: 1 }} />
          <span>{progress}%</span>
        </div>
      )}

      {/* Status */}
      {status && <p style={{ margin: 0 }}>{status}</p>}

      {/* Job Info */}
      {jobStatus && (
        <div style={{ backgroundColor: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
          <h3 style={{ marginTop: 0 }}>Job Details</h3>
          <table style={{ width: "100%", fontSize: "0.9rem" }}>
            <tbody>
              <tr><td><strong>Job ID:</strong></td><td>{jobStatus.jobId.substring(0, 8)}...</td></tr>
              <tr><td><strong>Status:</strong></td><td>{jobStatus.status}</td></tr>
              <tr><td><strong>Scale:</strong></td><td>{jobStatus.scaleFactor}x</td></tr>
              <tr><td><strong>Model:</strong></td><td>{jobStatus.modelName}</td></tr>
              <tr><td><strong>Processing Time:</strong></td><td>{formatTime(jobStatus.processingTimeMs)}</td></tr>
            </tbody>
          </table>
          
          {jobStatus.status === "COMPLETED" && (
            <button 
              onClick={handleDownload} 
              disabled={downloadingOutput}
              style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
            >
              {downloadingOutput ? "Downloading..." : "Download Upscaled Image"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
