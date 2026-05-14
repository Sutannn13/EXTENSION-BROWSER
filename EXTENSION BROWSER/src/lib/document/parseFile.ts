import { parsePdf } from './parsePdf';
import { parseDocx } from './parseDocx';
import { parseText } from './parseText';

export async function parseFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'pdf': return parsePdf(file);
    case 'docx': return parseDocx(file);
    case 'txt':
    case 'md':
    case 'csv': return parseText(file);
    default: throw new Error(`Unsupported file type: ${extension}`);
  }
}

export function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    md: 'text/markdown',
    csv: 'text/csv',
  };
  return typeMap[extension] || 'application/octet-stream';
}