import { SavedWord, DailyGoal, ReminderSetting } from '../types';

const KEYS = {
  SAVED_WORDS: 'flyhigh_saved_words',
  RECENT_SEARCHES: 'flyhigh_recent_searches',
  STREAK_INFO: 'flyhigh_streak_info',
  DAILY_GOALS: 'flyhigh_daily_goals',
  REMINDER_SETTINGS: 'flyhigh_reminder_settings',
  WRITING_HISTORY: 'flyhigh_writing_history',
  PRONUNCIATION_HISTORY: 'flyhigh_pronunciation_history',
};

export function getSavedWords(): SavedWord[] {
  try {
    const raw = localStorage.getItem(KEYS.SAVED_WORDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWordToStorage(word: Omit<SavedWord, 'id' | 'createdAt'>): SavedWord {
  const words = getSavedWords();
  const existing = words.find((w) => w.word.toLowerCase() === word.word.toLowerCase());
  if (existing) return existing;

  const newWord: SavedWord = {
    ...word,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  const updated = [newWord, ...words];
  localStorage.setItem(KEYS.SAVED_WORDS, JSON.stringify(updated));
  return newWord;
}

export function removeSavedWord(id: string): void {
  const words = getSavedWords();
  const updated = words.filter((w) => w.id !== id);
  localStorage.setItem(KEYS.SAVED_WORDS, JSON.stringify(updated));
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): string[] {
  let list = getRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase());
  list.unshift(term);
  list = list.slice(0, 10);
  localStorage.setItem(KEYS.RECENT_SEARCHES, JSON.stringify(list));
  return list;
}

// Streak Calculation
export interface StreakInfo {
  count: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export function getStreakInfo(): StreakInfo {
  try {
    const raw = localStorage.getItem(KEYS.STREAK_INFO);
    const today = new Date().toISOString().split('T')[0];
    if (!raw) {
      const initial = { count: 1, lastActiveDate: today };
      localStorage.setItem(KEYS.STREAK_INFO, JSON.stringify(initial));
      return initial;
    }
    const info: StreakInfo = JSON.parse(raw);
    const lastDate = new Date(info.lastActiveDate);
    const currDate = new Date(today);
    const diffDays = Math.floor((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      return info; // Already active today
    } else if (diffDays === 1) {
      // Consecutive day! Increment streak
      info.count += 1;
      info.lastActiveDate = today;
      localStorage.setItem(KEYS.STREAK_INFO, JSON.stringify(info));
      return info;
    } else if (diffDays > 1) {
      // Streak broken, reset
      info.count = 1;
      info.lastActiveDate = today;
      localStorage.setItem(KEYS.STREAK_INFO, JSON.stringify(info));
      return info;
    }
    return info;
  } catch {
    return { count: 1, lastActiveDate: new Date().toISOString().split('T')[0] };
  }
}

// Daily Goals Tracker
export function getDailyGoals(): DailyGoal {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(`${KEYS.DAILY_GOALS}_${today}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  const defaultGoals: DailyGoal = {
    targetWords: 5,
    learnedWords: 0,
    targetWriting: 1,
    completedWriting: 0,
    targetSpeaking: 2,
    completedSpeaking: 0,
  };
  localStorage.setItem(`${KEYS.DAILY_GOALS}_${today}`, JSON.stringify(defaultGoals));
  return defaultGoals;
}

export function updateDailyGoalProgress(type: 'words' | 'writing' | 'speaking', increment = 1): DailyGoal {
  const goals = getDailyGoals();
  const today = new Date().toISOString().split('T')[0];
  if (type === 'words') goals.learnedWords += increment;
  if (type === 'writing') goals.completedWriting += increment;
  if (type === 'speaking') goals.completedSpeaking += increment;

  localStorage.setItem(`${KEYS.DAILY_GOALS}_${today}`, JSON.stringify(goals));
  getStreakInfo(); // Keep streak alive
  return goals;
}

// Reminders Setting
export function getReminderSettings(): ReminderSetting[] {
  try {
    const raw = localStorage.getItem(KEYS.REMINDER_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  const defaults: ReminderSetting[] = [
    { time: '08:00', label: 'Nhắc nhở học từ vựng sáng', enabled: true },
    { time: '12:30', label: 'Luyện nghe & phát âm trưa', enabled: true },
    { time: '20:00', label: 'Luyện viết & ôn tập buổi tối', enabled: true },
  ];
  localStorage.setItem(KEYS.REMINDER_SETTINGS, JSON.stringify(defaults));
  return defaults;
}

export function saveReminderSettings(settings: ReminderSetting[]): void {
  localStorage.setItem(KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
}
