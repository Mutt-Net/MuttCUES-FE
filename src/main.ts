import { uploadFileWithProgress, downloadFile } from "./api/fileservice";

// Get DOM elements
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const uploadBtn = document.getElementById("uploadBtn") as HTMLButtonElement;
const downloadBtn = document.getElementById("downloadBtn") as HTMLButtonElement;
const fileIdInput = document.getElementById("fileIdInput") as HTMLInputElement;
const uploadStatus = document.getElementById("uploadStatus") as HTMLParagraphElement;
const progressBar = document.getElementById("uploadProgress") as HTMLProgressElement;
const progressText = document.getElementById("uploadPercent") as HTMLSpanElement;

// ----------------------------
// Upload file
// ----------------------------
uploadBtn.addEventListener("click", async () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    uploadStatus.textContent = "Please select a file.";
    return;
  }

  const file = fileInput.files[0];

  // Reset progress
  progressBar.value = 0;
  progressText.textContent = "0%";
  uploadStatus.textContent = "Uploading...";

  try {
    const fileId = await uploadFileWithProgress(file, (percent) => {
      progressBar.value = percent;
      progressText.textContent = `${percent}%`;
    });

    uploadStatus.textContent = `Upload complete! File ID: ${fileId}`;
    fileIdInput.value = fileId; // auto-fill file ID for download
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "Upload failed. See console for details.";
  }
});

// ----------------------------
// Download file
// ----------------------------
downloadBtn.addEventListener("click", async () => {
  const fileId = fileIdInput.value.trim();
  if (!fileId) {
    alert("Please enter a File ID to download.");
    return;
  }

  try {
    const blob = await downloadFile(fileId);
    const url = URL.createObjectURL(blob);

    // Create temporary <a> to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileId;
    document.body.appendChild(a); // Firefox requires this
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Download failed. Check console for details.");
  }
});
