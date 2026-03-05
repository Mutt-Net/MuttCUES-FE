export interface FileValidationOptions {
  maxBytes: number;
  allowedTypes: string[];
}

export function validateFile(file: File, options: FileValidationOptions): string | null {
  if (!options.allowedTypes.includes(file.type)) {
    return `Unsupported file type: ${file.type}`;
  }
  if (file.size > options.maxBytes) {
    const maxMb = (options.maxBytes / 1024 / 1024).toFixed(0);
    return `File is too large: ${(file.size / 1024 / 1024).toFixed(2)} MB (max ${maxMb} MB)`;
  }
  return null;
}
