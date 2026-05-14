import type { RankedChunk } from './rankChunks';

export function buildContext(chunks: RankedChunk[]): string {
  if (chunks.length === 0) return '';

  const contextParts: string[] = [];
  contextParts.push('=== MATERI REFERENSI ===\n');

  chunks.forEach((chunk, index) => {
    contextParts.push(`--- Bagian ${index + 1} ---`);
    contextParts.push(chunk.text);
    contextParts.push('');
  });

  contextParts.push('=====================');
  contextParts.push('\nBerdasarkan materi di atas, jawab pertanyaan user.');

  return contextParts.join('\n');
}