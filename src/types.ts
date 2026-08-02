export type AppTab = 'dict' | 'vocab1000' | 'writing' | 'pronunciation' | 'reminders';

export interface TopicWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  vietnamese: string;
  exampleEn: string;
  exampleVi: string;
  category: string;
  categoryId: string;
}

export type DictMode = 'en2vi' | 'vi2en';

export interface DictResult {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  vietnamese: string;
  definitions: string[];
  examples: string[];
  collocations?: string[];
  synonyms?: string[];
  antonyms?: string[];
  idioms?: { idiom: string; meaning: string }[];
  error?: string;
}

export interface WritingMistake {
  original: string;
  correction: string;
  type: 'grammar' | 'vocabulary' | 'spelling' | 'phrasing' | 'punctuation';
  explanationVi: string;
  nativeExample?: string;
}

export interface WritingAnalysis {
  originalText: string;
  mode: string;
  tone: string;
  correctedText: string;
  nativeVersion: string;
  overallScore: number;
  grammarScore: number;
  vocabScore: number;
  naturalnessScore: number;
  coherenceScore: number;
  summaryFeedbackVi: string;
  mistakes: WritingMistake[];
  keyVocabularyVi: { term: string; meaning: string; usage: string }[];
  debateFeedback?: {
    hasOpinion: boolean;
    opinionFeedbackVi: string;
    hasReason: boolean;
    reasonFeedbackVi: string;
    hasExample: boolean;
    exampleFeedbackVi: string;
    overallDebateAdviceVi: string;
    stanceVi?: string;
  };
  cefrBenchmarkSuggestions?: DebateSuggestionItem[];
}

export interface DebateSuggestionItem {
  level: string;
  levelCode: 'A1-A2' | 'B1-B2' | 'C1-C2';
  side: string;
  opinionStarter: string;
  opinion: string;
  reasonStarter: string;
  reason: string;
  exampleStarter: string;
  example: string;
  fullAnswer: string;
  vietnameseTranslation: string;
}

export interface DebateSuggestionResponse {
  question: string;
  suggestions: DebateSuggestionItem[];
}

export interface WordPronunciationFeedback {
  word: string;
  expectedIpa?: string;
  spoken?: string;
  status: 'perfect' | 'good' | 'needs_work';
  score: number;
  tipVi?: string;
}

export interface PronunciationAnalysis {
  targetText: string;
  recognizedText: string;
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  intonationScore: number;
  wordFeedback: WordPronunciationFeedback[];
  phoneticTipsVi: string[];
  nativeSpeakerTipVi: string;
}

export interface SavedWord {
  id: string;
  word: string;
  phonetic: string;
  vietnamese: string;
  partOfSpeech: string;
  example: string;
  createdAt: number;
}

export interface DailyGoal {
  targetWords: number;
  learnedWords: number;
  targetWriting: number;
  completedWriting: number;
  targetSpeaking: number;
  completedSpeaking: number;
}

export interface ReminderSetting {
  time: string; // e.g. "08:00"
  label: string;
  enabled: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  level?: 'basic' | 'intermediate' | 'advanced' | string;
  levelName?: string;
  explanationVi: string;
}

export interface WordOfTheDay {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  vietnamese: string;
  definitionEn: string;
  exampleEn: string;
  exampleVi: string;
  usageTipVi: string;
}
