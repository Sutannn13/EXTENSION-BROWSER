import * as pdfjsLib from 'pdfjs-dist';
import { WorkerMessageHandler } from 'pdfjs-dist/build/pdf.worker.mjs';

globalThis.pdfjsWorker = { WorkerMessageHandler };

function getPdfWorkerUrl(): string {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL('pdf.worker.min.mjs');
  }

  return '/pdf.worker.min.mjs';
}

pdfjsLib.GlobalWorkerOptions.workerSrc = getPdfWorkerUrl();

export async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const textParts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}
