// const API_BASE_URL = "/api"; // comment this out
const API_BASE_URL = "http://localhost:8080/api"; // direct to backend

export function uploadFileWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);

    xhr.open("POST", `${API_BASE_URL}/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      console.log("Upload response:", xhr.responseText); // <-- debug
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.fileId) resolve(response.fileId);
          else reject(new Error(response.error || "Unknown error"));
        } catch (err) {
          reject(new Error("Invalid JSON response"));
        }
      } else {
        reject(new Error("Upload failed with status " + xhr.status));
      }
    };

    xhr.onerror = () => {
      console.error("Upload network error");
      reject(new Error("Network error"));
    };

    xhr.send(formData);
  });
}

export async function downloadFile(fileId: string): Promise<Blob> {
  const url = `${API_BASE_URL}/files/${fileId}`;
  console.log("Downloading from:", url); // <-- debug
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    console.error("Download failed:", text);
    throw new Error("Download failed: " + response.statusText);
  }

  return await response.blob();
}
