export interface TextChunk {
  id: string;
  text: string;
  index: number;
  wordCount: number;
  estimatedPage?: number;
}

interface ChunkConfig {
  targetWordCount: number;
  overlapWordCount: number;
  minChunkWords: number;
}

const DEFAULT_CONFIG: ChunkConfig = { targetWordCount: 900, overlapWordCount: 125, minChunkWords: 100 };

export function chunkText(text: string, config: Partial<ChunkConfig> = {}): TextChunk[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  if (!cleanedText) return [];

  const paragraphs = cleanedText.split(/\n\n+/).filter((p) => p.trim());
  const chunks: TextChunk[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter((w) => w.length > 0);
    const paragraphWordCount = words.length;

    if (currentWordCount + paragraphWordCount > finalConfig.targetWordCount && currentWordCount >= finalConfig.minChunkWords) {
      const chunkText = currentChunk.join('\n\n');
      chunks.push({ id: `chunk-${chunkIndex}`, text: chunkText, index: chunkIndex, wordCount: currentWordCount, estimatedPage: Math.floor(chunkIndex * 0.2) + 1 });

      const overlapWords = getLastWords(currentChunk.join(' '), finalConfig.overlapWordCount);
      currentChunk = overlapWords ? [overlapWords] : [];
      currentWordCount = overlapWords ? overlapWords.split(/\s+/).filter((w) => w.length > 0).length : 0;
      chunkIndex++;
    }

    currentChunk.push(paragraph);
    currentWordCount += paragraphWordCount;
  }

  if (currentChunk.length > 0 && currentWordCount >= finalConfig.minChunkWords) {
    const chunkText = currentChunk.join('\n\n');
    chunks.push({ id: `chunk-${chunkIndex}`, text: chunkText, index: chunkIndex, wordCount: currentWordCount, estimatedPage: Math.floor(chunkIndex * 0.2) + 1 });
  }

  return chunks;
}

function getLastWords(text: string, wordCount: number): string {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length <= wordCount) return words.join(' ');
  return words.slice(-wordCount).join(' ');
}