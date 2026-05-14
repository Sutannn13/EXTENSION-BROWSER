import React, { useCallback, useState } from 'react';
import { cn } from '../lib/utils/cn';
import type { FileUploaderProps } from './types';

export default function FileUploader({ onFileSelect, isLoading = false, accept = '.pdf,.docx,.txt,.md,.csv', maxSize = 20 * 1024 * 1024, className }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (file.size > maxSize) {
      setError(`File terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB.`);
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = accept.split(',').map((ext) => ext.trim().replace('.', ''));
    if (!extension || !allowedExtensions.includes(extension)) {
      setError(`Format file tidak didukung. Gunakan: ${accept}`);
      return;
    }
    onFileSelect(file);
  }, [onFileSelect, maxSize, accept]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-colors',
          isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50',
          isLoading && 'opacity-50'
        )}
      >
        <input type="file" accept={accept} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} disabled={isLoading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-slate-400">Memproses file...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-slate-300"><span className="text-blue-400 font-medium">Klik untuk upload</span> atau drag & drop</p>
            <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT, MD, CSV • Maksimal {maxSize / 1024 / 1024}MB</p>
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-400 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</p>}
    </div>
  );
}