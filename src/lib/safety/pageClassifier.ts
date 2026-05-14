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

const RESTRICTED_KEYWORDS = ['quiz', 'kuis', 'ujian', 'exam', 'test', 'assessment', 'evaluasi', 'simulasi', 'proctor', 'tryout', 'final', 'midterm', 'uts', 'uas', 'soal', 'jawaban'];
const RESTRICTED_URL_PATTERNS = [/quiz/i, /kuis/i, /ujian/i, /exam/i, /test/i, /assessment/i, /evaluation/i, /proctor/i, /tryout/i];

export function classifyPage(pageInfo: PageInfo): PageClassification {
  const { url, title, headings } = pageInfo;
  const allText = [title, ...headings].join(' ').toLowerCase();
  const matchedKeywords: string[] = [];

  for (const pattern of RESTRICTED_URL_PATTERNS) {
    if (pattern.test(url) && !matchedKeywords.includes(pattern.source.replace(/[/\ig]/g, ''))) {
      matchedKeywords.push(pattern.source.replace(/[/\ig]/g, ''));
    }
  }

  for (const keyword of RESTRICTED_KEYWORDS) {
    if (allText.includes(keyword) && !matchedKeywords.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  const isRestricted = matchedKeywords.length >= 2;

  return {
    isRestricted,
    reason: isRestricted ? `Deteksi konten: ${matchedKeywords.slice(0, 3).join(', ')}${matchedKeywords.length > 3 ? '...' : ''}` : undefined,
    matchedKeywords,
  };
}