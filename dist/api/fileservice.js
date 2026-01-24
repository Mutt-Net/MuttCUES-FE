const API_BASE_URL = "https://api.example.com";
export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData
    });
    if (!response.ok) {
        throw new Error("Upload failed");
    }
    const data = await response.json();
    return data.fileId;
}
export async function downloadFile(fileId) {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`);
    if (!response.ok) {
        throw new Error("Download failed");
    }
    return await response.blob();
}
