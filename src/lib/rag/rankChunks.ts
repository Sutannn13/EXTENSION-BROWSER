import type { TextChunk } from '../document/chunkText';

export interface RankedChunk extends TextChunk {
  score: number;
  matchedKeywords: string[];
}

export function rankChunks(query: string, chunks: TextChunk[], topK: number = 5): RankedChunk[] {
  const queryTokens = tokenize(query);
  const queryKeywords = extractKeywords(queryTokens);

  const scoredChunks: RankedChunk[] = chunks.map((chunk) => {
    const chunkTokens = tokenize(chunk.text);
    const chunkKeywords = extractKeywords(chunkTokens);
    const keywordOverlap = calculateKeywordOverlap(queryKeywords, chunkKeywords);
    const positionBonus = calculatePositionBonus(chunk.text, queryKeywords);
    const densityScore = calculateDensityScore(chunk.text, queryKeywords);
    const score = keywordOverlap * 0.5 + positionBonus * 0.2 + densityScore * 0.3;

    return { ...chunk, score, matchedKeywords: getMatchedKeywords(queryKeywords, chunkKeywords) };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK);
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter((word) => word.length > 1);
}

function extractKeywords(tokens: string[]): string[] {
  const stopWords = new Set(['dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'dengan', 'adalah', 'ini', 'itu', 'pada', 'dalam', 'akan', 'juga', 'tidak', 'ada', 'sudah', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']);
  return tokens.filter((token) => !stopWords.has(token) && token.length > 2);
}

function calculateKeywordOverlap(queryKeywords: string[], chunkKeywords: string[]): number {
  if (queryKeywords.length === 0) return 0;
  const querySet = new Set(queryKeywords);
  let matches = 0;
  for (const keyword of chunkKeywords) {
    if (querySet.has(keyword)) matches++;
  }
  return matches / queryKeywords.length;
}

function calculatePositionBonus(text: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const lowerText = text.toLowerCase();
  let totalBonus = 0;
  for (const keyword of keywords) {
    const position = lowerText.indexOf(keyword);
    if (position !== -1) {
      totalBonus += 1 - Math.min(position / 1000, 1);
    }
  }
  return totalBonus / keywords.length;
}

function calculateDensityScore(text: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const lowerText = text.toLowerCase();
  let totalOccurrences = 0;
  for (const keyword of keywords) {
    const regex = new RegExp(keyword, 'gi');
    const matches = lowerText.match(regex);
    if (matches) totalOccurrences += matches.length;
  }
  return Math.min(totalOccurrences / (text.length / 100), 1.0);
}

function getMatchedKeywords(queryKeywords: string[], chunkKeywords: string[]): string[] {
  const querySet = new Set(queryKeywords);
  return chunkKeywords.filter((keyword) => querySet.has(keyword));
}