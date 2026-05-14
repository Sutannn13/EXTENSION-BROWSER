export interface DisallowedCheck {
  isDisallowed: boolean;
  message: string;
  detectedPatterns: string[];
}

const DISALLOWED_PATTERNS = [
  { pattern: /jawab(kan)?\s+(soal|tugas|pertanyaan)/i, message: 'Maaf, saya tidak bisa memberikan jawaban langsung untuk soal. Gunakan fitur "Tanya Konsep" untuk memahami materinya.' },
  { pattern: /pilihkan\s+(jawaban|opsi)/i, message: 'Maaf, saya tidak bisa memilihkan jawaban untuk kamu. Saya bisa membantu menjelaskan konsep agar kamu bisa menjawab sendiri.' },
  { pattern: /kerjakan\s+(soal|ujian|tugas)/i, message: 'Maaf, saya dirancang untuk membantu belajar, bukan mengerjakan soal ujian.' },
  { pattern: /bypass/i, message: 'Maaf, saya tidak bisa digunakan untuk membypass sistem keamanan apapun.' },
  { pattern: /cheat/i, message: 'Maaf, saya tidak bisa digunakan untuk kecurangan akademik.' },
  { pattern: /contek(an)?/i, message: 'Maaf, saya tidak bisa digunakan untuk contekan.' },
  { pattern: /give\s+me\s+(the\s+)?answer/i, message: 'I cannot give you exam answers. Use the learning features to understand concepts.' },
  { pattern: /solve\s+(this|my)\s+(exam|test|quiz)/i, message: 'I cannot solve exams or tests. I can help you understand concepts for learning purposes.' },
];

export function isQuestionDisallowed(question: string): DisallowedCheck {
  const detectedPatterns: string[] = [];

  for (const { pattern } of DISALLOWED_PATTERNS) {
    if (pattern.test(question)) {
      detectedPatterns.push(pattern.source);
    }
  }

  if (detectedPatterns.length === 0) {
    return { isDisallowed: false, message: '', detectedPatterns: [] };
  }

  const firstMatch = DISALLOWED_PATTERNS.find(({ pattern }) => pattern.test(question));

  return {
    isDisallowed: true,
    message: firstMatch?.message || 'Maaf, pertanyaan ini tidak bisa saya jawab.',
    detectedPatterns,
  };
}

export const detectDisallowedQuestion = isQuestionDisallowed;