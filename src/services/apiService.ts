import {
  DictResult,
  WritingAnalysis,
  PronunciationAnalysis,
  WordOfTheDay,
  QuizQuestion,
  DebateSuggestionResponse,
} from '../types';

export async function lookupDictionary(word: string, mode: 'en2vi' | 'vi2en'): Promise<DictResult> {
  const response = await fetch('/api/dictionary/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, mode }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Không thể tìm thấy kết quả tra từ');
  }
  return response.json();
}

export async function translateParagraph(text: string): Promise<{
  direction: string;
  translation: string;
  keyVocabulary?: { term: string; phonetic: string; meaning: string }[];
}> {
  const response = await fetch('/api/dictionary/translate-paragraph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi khi dịch đoạn văn');
  }
  return response.json();
}

export async function correctWriting(text: string, mode: string, tone: string, level?: string): Promise<WritingAnalysis> {
  const response = await fetch('/api/writing/correct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, mode, tone, level }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi khi phân tích và sửa bài viết');
  }
  return response.json();
}

export async function evaluatePronunciation(
  targetText: string,
  recognizedText: string
): Promise<PronunciationAnalysis> {
  const response = await fetch('/api/pronunciation/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetText, recognizedText }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi khi đánh giá phát âm');
  }
  return response.json();
}

export async function fetchWordOfTheDay(): Promise<WordOfTheDay> {
  const response = await fetch('/api/daily/word-of-the-day');
  if (!response.ok) {
    throw new Error('Lỗi khi tải từ vựng hôm nay');
  }
  return response.json();
}

export async function fetchDailyQuiz(level: string = 'all'): Promise<{ questions: QuizQuestion[] }> {
  const response = await fetch(`/api/daily/quiz?level=${encodeURIComponent(level)}`);
  if (!response.ok) {
    throw new Error('Lỗi khi tải bài tập hôm nay');
  }
  return response.json();
}

export async function suggestDebateAnswers(
  question: string,
  level: string = 'all'
): Promise<DebateSuggestionResponse> {
  const response = await fetch('/api/writing/suggest-debate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, level }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi khi gợi ý câu trả lời tranh luận');
  }
  return response.json();
}
