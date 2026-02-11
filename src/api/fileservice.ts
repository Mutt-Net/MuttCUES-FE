const API_BASE = "/api"; // Vite proxy will forward to http://localhost:8080

/**
 * Upload a file with progress callback.
 * @param file The file to upload
 * @param onProgress Callback receiving percent (0-100)
 * @returns Promise resolving to the uploaded fileId
 */
export async function uploadFileWithProgress(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_BASE}/upload`);

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
          resolve(resp.fileId);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed due to network error"));

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

/**
 * Download a file by ID.
 * @param fileId The ID returned from the upload endpoint
 * @returns Promise resolving to a Blob
 */
export async function downloadFile(fileId: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/upload/${encodeURIComponent(fileId)}`
  );

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  return response.blob();
}

