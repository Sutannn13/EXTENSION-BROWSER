export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult {
  if (!file) return { valid: false, error: 'File tidak ditemukan' };

  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `File terlalu besar. Maksimal 20MB.` };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedExtensions = ['pdf', 'docx', 'txt', 'md', 'csv'];
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: `Format file tidak didukung. Gunakan: ${allowedExtensions.map((e) => `.${e}`).join(', ')}` };
  }

  if (file.name.length > 255) {
    return { valid: false, error: 'Nama file terlalu panjang. Maksimal 255 karakter.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File kosong' };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}