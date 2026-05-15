export interface PageClassification {
  isRestricted: boolean;
  reason?: string;
  matchedKeywords: string[];
}

interface PageInfo {
  url: string;
  title: string;
  headings: string[];
}

const HIGH_CONFIDENCE_RESTRICTED_KEYWORDS = ['quiz', 'kuis', 'ujian', 'exam', 'assessment', 'evaluasi', 'simulasi', 'proctor', 'tryout', 'midterm', 'uts', 'uas'];
const LOW_CONFIDENCE_RESTRICTED_KEYWORDS = ['test', 'evaluation', 'final', 'soal', 'jawaban'];
const RESTRICTED_KEYWORDS = [...HIGH_CONFIDENCE_RESTRICTED_KEYWORDS, ...LOW_CONFIDENCE_RESTRICTED_KEYWORDS];

function containsKeyword(value: string, keyword: string): boolean {
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escapedKeyword}([^a-z0-9]|$)`, 'i').test(value);
}

function safeDecodeUrl(value: string): string {
  try {
    return decodeURIComponent(value).toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

export function classifyPage(pageInfo: PageInfo): PageClassification {
  const { url, title, headings } = pageInfo;
  const decodedUrl = safeDecodeUrl(url);
  const allText = [title, ...headings].join(' ').toLowerCase();
  const matchedKeywords: string[] = [];

  for (const keyword of RESTRICTED_KEYWORDS) {
    if ((containsKeyword(decodedUrl, keyword) || containsKeyword(allText, keyword)) && !matchedKeywords.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  const highConfidenceMatches = matchedKeywords.filter((keyword) => HIGH_CONFIDENCE_RESTRICTED_KEYWORDS.includes(keyword));
  const lowConfidenceMatches = matchedKeywords.filter((keyword) => LOW_CONFIDENCE_RESTRICTED_KEYWORDS.includes(keyword));
  const isRestricted = highConfidenceMatches.length > 0 || lowConfidenceMatches.length >= 2;

  return {
    isRestricted,
    reason: isRestricted ? `Deteksi konten: ${matchedKeywords.slice(0, 3).join(', ')}${matchedKeywords.length > 3 ? '...' : ''}` : undefined,
    matchedKeywords,
  };
}
