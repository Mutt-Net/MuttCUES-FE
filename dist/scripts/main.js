import { uploadFile, downloadFile } from "../api/fileservice";
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const downloadBtn = document.getElementById("downloadBtn");
const fileIdInput = document.getElementById("fileIdInput");
const uploadStatus = document.getElementById("uploadStatus");
uploadBtn.addEventListener("click", async () => {
    if (!fileInput.files || fileInput.files.length === 0) {
        uploadStatus.textContent = "Please select a file.";
        return;
    }
    try {
        uploadStatus.textContent = "Uploading...";
        const fileId = await uploadFile(fileInput.files[0]);
        uploadStatus.textContent = `Uploaded successfully. File ID: ${fileId}`;
    }
    catch (err) {
        uploadStatus.textContent = "Upload failed.";
    }
});
downloadBtn.addEventListener("click", async () => {
    const fileId = fileIdInput.value.trim();
    if (!fileId)
        return;
    try {
        const blob = await downloadFile(fileId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileId;
        a.click();
        URL.revokeObjectURL(url);
    }
    catch {
        alert("Download failed");
    }
});
