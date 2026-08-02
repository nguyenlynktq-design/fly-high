let voicesCache: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  voicesCache = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = window.speechSynthesis.getVoices();
  };
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      voicesCache = voices;
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    };
    setTimeout(() => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    }, 200);
  });
}

export function pickVoice(lang: string, preferFemale: boolean = true): SpeechSynthesisVoice | null {
  const list = voicesCache.length ? voicesCache : window.speechSynthesis?.getVoices() || [];
  const exactLangList = list.filter((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase());
  const broadList = list.filter((v) => v.lang && v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  const pool = exactLangList.length ? exactLangList : broadList;

  // Specific high-quality natural female voice names across Chrome, Edge, Safari, iOS, Android, macOS, Windows
  const naturalFemaleNames: Record<string, string[]> = {
    'en-GB': [
      'Google UK English Female',
      'Microsoft Libby Online (Natural) - English (United Kingdom)',
      'Microsoft Sonia Online (Natural) - English (United Kingdom)',
      'Microsoft Maisie Online (Natural) - English (United Kingdom)',
      'Libby',
      'Sonia',
      'Hazel',
      'Kate',
      'Serena',
      'Stephanie',
      'Amy',
      'Victoria',
      'Fiona',
    ],
    'en-US': [
      'Google US English',
      'Microsoft Ava Online (Natural) - English (United States)',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Aria',
      'Jenny',
      'Samantha',
      'Ava',
      'Allison',
      'Susan',
      'Zira',
      'Karen',
      'Siri',
    ],
    'vi-VN': ['Google Vietnamese', 'HoaiMy', 'NamMinh', 'Linh', 'An'],
  };

  const prefs = naturalFemaleNames[lang] || [];

  // 1. Try exact match from preferred female names list
  for (const p of prefs) {
    const match = pool.find((v) => v.name.toLowerCase().includes(p.toLowerCase()));
    if (match) return match;
  }

  // 2. Try any voice containing 'female' or 'woman' or 'natural'
  if (preferFemale) {
    const femaleKw = pool.find(
      (v) =>
        /female|woman|girl|natural|aria|jenny|samantha|libby|sonia|kate/i.test(v.name) &&
        !/male|man|boy/i.test(v.name)
    );
    if (femaleKw) return femaleKw;

    // 3. Any non-male voice in pool
    const nonMale = pool.find((v) => !/\bmale\b|\bman\b/i.test(v.name));
    if (nonMale) return nonMale;
  }

  return pool[0] || broadList[0] || null;
}

export function cleanEnglishTextOnly(text: string): string {
  if (!text) return '';

  const viRegex = /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ]/;

  // 1. Remove IPA phonetic slashes e.g. /ˌpɜː.sɪˈvɪə.rəns/ or [IPA]
  let clean = text.replace(/\/[^\/]+\//g, ' ').replace(/\[[^\]]+\]/g, ' ');

  // 2. Remove parenthetical or bracketed text if it contains Vietnamese diacritics
  clean = clean.replace(/\(([^)]*)\)/g, (match, p1) => {
    return viRegex.test(p1) ? '' : match;
  });

  // 3. Handle line-by-line or dash/colon/slash delimited translations
  const lines = clean.split('\n');
  const processedLines = lines.map((line) => {
    if (/ [-:\/—] /.test(line) || /[:\/]/.test(line)) {
      const parts = line.split(/(?:\s+[-:—\/]\s+|\s*[:\/]\s*)/);
      const engParts = parts.filter((part) => !viRegex.test(part));
      if (engParts.length > 0) {
        return engParts.join(' ');
      }
    }
    return line;
  });

  clean = processedLines.join(' ');

  // 4. Remove individual words with Vietnamese diacritics
  const words = clean.split(/(\s+)/);
  const filteredWords = words.map((w) => (viRegex.test(w) ? '' : w));
  clean = filteredWords.join('');

  // 5. Clean extra spaces and punctuation left behind
  clean = clean
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.?!;:])/g, '$1')
    .trim();

  return clean || text;
}

export async function speakText(
  text: string,
  lang: 'en-GB' | 'en-US' | 'vi-VN' = 'en-US',
  rate: number = 0.95,
  onBoundary?: (charIndex: number) => void,
  onEnd?: () => void
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // If reading English (en-US or en-GB), clean text so it ONLY reads English parts
  let textToSpeak = text;
  if (lang === 'en-US' || lang === 'en-GB') {
    textToSpeak = cleanEnglishTextOnly(text);
  }

  if (!textToSpeak.trim()) return;

  // Instant response if voices already cached
  if (!voicesCache || !voicesCache.length) {
    await loadVoices();
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = lang;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.rate = rate;

  if (onBoundary) {
    utterance.onboundary = (e) => {
      if (e.charIndex !== undefined) {
        onBoundary(e.charIndex);
      }
    };
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ================= SPEECH RECOGNITION UTILS =================
export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export class SpeechRecognizer {
  private recognition: any = null;
  public isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.isSupported = true;
      }
    }
  }

  public start(
    onResult: (res: SpeechRecognitionResult) => void,
    onError?: (err: any) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Trình duyệt không hỗ trợ Web Speech Recognition');
      return;
    }

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      onResult({
        transcript: final || interim,
        isFinal: !!final,
        confidence: event.results[0]?.[0]?.confidence || 0.9,
      });
    };

    this.recognition.onerror = (event: any) => {
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition start error:', e);
    }
  }

  public stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('SpeechRecognition stop error:', e);
      }
    }
  }
}
