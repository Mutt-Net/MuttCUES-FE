const API_BASE = "/api";

export interface JobStatus {
  jobId: string;
  inputFileId: string;
  outputFileId: string | null;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  scaleFactor: number;
  modelName: string;
  progressPercent: number;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  processingTimeMs: number | null;
}

export interface JobStatistics {
  totalJobs: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  successRate: number;
  averageProcessingTimeMs: number;
}

export interface JobSubmitResponse {
  jobId: string;
  inputFileId: string;
  status: string;
  scaleFactor: number;
  modelName: string;
}

export async function submitProcessingJob(
  file: File,
  scaleFactor: number = 2,
  modelName: string = "ultramix_balanced",
  onProgress?: (percent: number) => void
): Promise<JobSubmitResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_BASE}/jobs/process`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const resp = JSON.parse(xhr.responseText);
          resolve(resp);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Submit failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Submit failed due to network error"));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("scaleFactor", scaleFactor.toString());
    formData.append("modelName", modelName);
    xhr.send(formData);
  });
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE}/jobs/${encodeURIComponent(jobId)}`);
  if (!response.ok) {
    throw new Error(`Failed to get job status: ${response.status}`);
  }
  return response.json();
}

export async function getJobHistory(page: number = 0, size: number = 20): Promise<{
  jobs: JobStatus[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}> {
  const response = await fetch(`${API_BASE}/jobs/history?page=${page}&size=${size}`);
  if (!response.ok) {
    throw new Error(`Failed to get job history: ${response.status}`);
  }
  return response.json();
}

export async function getJobStatistics(): Promise<JobStatistics> {
  const response = await fetch(`${API_BASE}/jobs/statistics`);
  if (!response.ok) {
    throw new Error(`Failed to get statistics: ${response.status}`);
  }
  return response.json();
}

export async function downloadFile(fileId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/upload/${encodeURIComponent(fileId)}`);
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }
  return response.blob();
}
