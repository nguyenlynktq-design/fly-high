import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Volume2,
  Sparkles,
  Search,
  PlusCircle,
  Gamepad2,
  Trophy,
  CheckCircle2,
  XCircle,
  RefreshCw,
  HelpCircle,
  Zap,
  BookmarkPlus,
  Play,
  RotateCcw,
  Check,
  Award
} from 'lucide-react';
import { VOCAB_CATEGORIES, RAW_VOCAB_LIST } from '../data/topicsVocabData';
import { TopicWord } from '../types';
import { speakText } from '../utils/speechUtils';
import { saveWordToStorage, updateDailyGoalProgress } from '../utils/storageUtils';

export const Vocab1000Tab: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<'explorer' | 'quiz' | 'spelling' | 'exam'>('explorer');

  // Search & Filter state for Explorer
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customWords, setCustomWords] = useState<TopicWord[]>(() => {
    try {
      const saved = localStorage.getItem('flyhigh_custom_vocab_words');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom Word Adder Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newCategory, setNewCategory] = useState('Gia đình');
  const [newExampleEn, setNewExampleEn] = useState('');
  const [newExampleVi, setNewExampleVi] = useState('');

  // Combined words (PDF 1000 words + student custom added words)
  const allWords = useMemo(() => {
    return [...customWords, ...RAW_VOCAB_LIST];
  }, [customWords]);

  // Filtered words in explorer
  const filteredWords = useMemo(() => {
    return allWords.filter((w) => {
      const matchesCategory = selectedCategory === 'all' || w.categoryId === selectedCategory || w.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const cleanQ = q.replace(/^stt\s*|^#/, '').trim();
      const matchesSearch =
        !q ||
        w.word.toLowerCase().includes(q) ||
        w.vietnamese.toLowerCase().includes(q) ||
        w.phonetic.toLowerCase().includes(q) ||
        w.id === cleanQ ||
        w.id === q;
      return matchesCategory && matchesSearch;
    });
  }, [allWords, selectedCategory, searchQuery]);

  // Handle adding custom word
  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) {
      alert('Vui lòng nhập từ tiếng Anh và nghĩa Tiếng Việt!');
      return;
    }

    const created: TopicWord = {
      id: `custom_${Date.now()}`,
      word: newWord.trim(),
      phonetic: newPhonetic.trim() || '/.../',
      partOfSpeech: 'n/adj/v',
      vietnamese: newMeaning.trim(),
      exampleEn: newExampleEn.trim() || `I use the word "${newWord.trim()}" in daily conversation.`,
      exampleVi: newExampleVi.trim() || `Tôi dùng từ "${newWord.trim()}" trong giao tiếp hàng ngày.`,
      category: newCategory,
      categoryId: 'custom',
    };

    const updated = [created, ...customWords];
    setCustomWords(updated);
    localStorage.setItem('flyhigh_custom_vocab_words', JSON.stringify(updated));

    // Also add to saved words
    saveWordToStorage({
      word: created.word,
      phonetic: created.phonetic,
      vietnamese: created.vietnamese,
      partOfSpeech: created.partOfSpeech,
      example: `${created.exampleEn} (${created.exampleVi})`,
    });

    // Reset Form
    setNewWord('');
    setNewPhonetic('');
    setNewMeaning('');
    setNewExampleEn('');
    setNewExampleVi('');
    setShowAddModal(false);

    alert(`🎉 Đã thêm thành công từ "${created.word}" vào danh sách học sinh!`);
  };

  // =========================================================================
  // GAME 2: SPEED QUIZ BLASTER STATE
  // =========================================================================
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<{
    word: TopicWord;
    options: string[];
    correctIndex: number;
  }[]>([]);

  const initSpeedQuiz = () => {
    const list = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
    const questions = list.map((target) => {
      const distractors = allWords
        .filter((w) => w.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.word);

      const options = [target.word, ...distractors].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(target.word);
      return { word: target, options, correctIndex };
    });

    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizStreak(0);
    setQuizSelectedOption(null);
  };

  const handleQuizAnswer = (optIndex: number) => {
    if (quizSelectedOption !== null) return;
    setQuizSelectedOption(optIndex);

    const currentQ = quizQuestions[quizIndex];
    if (optIndex === currentQ.correctIndex) {
      speakText(currentQ.word.word, 'en-US');
      setQuizScore((s) => s + 10 + quizStreak * 2);
      setQuizStreak((st) => st + 1);
    } else {
      setQuizStreak(0);
    }

    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex((i) => i + 1);
        setQuizSelectedOption(null);
      } else {
        updateDailyGoalProgress('words', 5);
      }
    }, 1200);
  };

  // =========================================================================
  // GAME 3: SPELLING BEE / TYPE THE WORD STATE
  // =========================================================================
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellingWords, setSpellingWords] = useState<TopicWord[]>([]);
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingSubmitted, setSpellingSubmitted] = useState(false);
  const [spellingIsCorrect, setSpellingIsCorrect] = useState(false);
  const [spellingScore, setSpellingScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const initSpellingBee = () => {
    const list = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 8);
    setSpellingWords(list);
    setSpellingIndex(0);
    setSpellingInput('');
    setSpellingSubmitted(false);
    setSpellingIsCorrect(false);
    setSpellingScore(0);
    setShowHint(false);
  };

  const handleSpellingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spellingInput.trim() || spellingSubmitted) return;

    const target = spellingWords[spellingIndex].word.trim().toLowerCase();
    const userInput = spellingInput.trim().toLowerCase();
    const isRight = userInput === target;

    setSpellingSubmitted(true);
    setSpellingIsCorrect(isRight);

    if (isRight) {
      speakText(spellingWords[spellingIndex].word, 'en-US');
      setSpellingScore((s) => s + 15);
    }
  };

  const nextSpellingWord = () => {
    if (spellingIndex + 1 < spellingWords.length) {
      setSpellingIndex((i) => i + 1);
      setSpellingInput('');
      setSpellingSubmitted(false);
      setSpellingIsCorrect(false);
      setShowHint(false);
    } else {
      updateDailyGoalProgress('words', 8);
    }
  };

  // =========================================================================
  // EXAM CHALLENGE STATE (1000 WORDS MASTERY TEST)
  // =========================================================================
  const [examQuestions, setExamQuestions] = useState<
    {
      word: TopicWord;
      options: string[];
      correctIndex: number;
      userAnswer?: number;
    }[]
  >([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examCount, setExamCount] = useState<number>(10);

  const initExam = (count: number = 10) => {
    setExamCount(count);
    const list = [...allWords].sort(() => 0.5 - Math.random()).slice(0, count);
    const questions = list.map((target) => {
      const distractors = allWords
        .filter((w) => w.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.vietnamese);

      const options = [target.vietnamese, ...distractors].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(target.vietnamese);
      return { word: target, options, correctIndex };
    });

    setExamQuestions(questions);
    setExamIndex(0);
    setExamAnswers({});
    setExamSubmitted(false);
  };

  // Render Sub-view Tab Switchers
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Sub-Header Banner */}
      <div className="bg-gradient-to-r from-[#3EC6F0] via-[#1AA6D9] to-[#2563EB] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit text-xs font-extrabold mb-3">
            <Sparkles className="w-4 h-4 text-[#FFCF44]" /> kho 1000 Từ Vựng Chuẩn Bản Xứ
          </div>
          <h2 className="font-['Baloo_2'] text-3xl sm:text-4xl font-extrabold leading-tight">
            1000 Từ Vựng Theo Chủ Đề &amp; Game Ôn Luyện 🎮
          </h2>
          <p className="text-sm font-medium mt-2 text-white/90">
            Tra cứu từ vựng kèm phát âm chuẩn, phiên âm IPA, nghĩa Tiếng Việt, câu ví dụ sinh động và thử thách kiểm tra siêu ghi nhớ!
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl border-2 border-[#EAE4D4] shadow-sm">
        {[
          { id: 'explorer', label: '📚 Tra Cứu 1000 Từ', icon: BookOpen, color: 'bg-[#3EC6F0]' },
          { id: 'quiz', label: '⚡ Trắc Nghiệm Nhanh', icon: Zap, color: 'bg-[#7ED957]', onSelect: initSpeedQuiz },
          { id: 'spelling', label: '✍️ Game Gõ Chính Xác', icon: RotateCcw, color: 'bg-[#FFCF44]', onSelect: initSpellingBee },
          { id: 'exam', label: '🏆 Thử Thách Kiểm Tra', icon: Trophy, color: 'bg-[#8B5CF6]', onSelect: () => initExam(10) },
        ].map((tab) => {
          const isActive = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubView(tab.id as any);
                if (tab.onSelect) tab.onSelect();
              }}
              className={`font-['Baloo_2'] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? `${tab.color} text-white border-transparent shadow-md scale-105`
                  : 'bg-[#FFFBF0] text-[#2B3350] border-[#EAE4D4] hover:border-[#3EC6F0]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* VIEW 1: EXPLORER & SEARCH & CUSTOM WORD ADDER                    */}
      {/* ================================================================= */}
      {activeSubView === 'explorer' && (
        <div className="space-y-6">
          {/* Top Search & Category Filter */}
          <div className="bg-white p-6 rounded-3xl border-3 border-[#EAE4D4] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo STT (#1, #2...), từ vựng hoặc nghĩa..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-[#EAE4D4] focus:border-[#3EC6F0] outline-none text-sm font-bold bg-[#FFFBF0]"
                />
              </div>

              {/* Add Custom Word Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto bg-[#FFCF44] hover:bg-[#e2a200] text-[#2B3350] font-['Baloo_2'] font-extrabold text-sm px-5 py-2.5 rounded-2xl border-2 border-[#E2A200] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
              >
                <PlusCircle className="w-5 h-5" /> + Điền Từ Học Sinh Muốn
              </button>
            </div>

            {/* Category Selector Pills */}
            <div className="pt-2">
              <span className="block text-xs font-extrabold text-[#6B7290] uppercase tracking-wider mb-2">
                📂 Danh mục chủ đề ({VOCAB_CATEGORIES.length} Chủ đề):
              </span>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#3EC6F0] text-white border-[#1AA6D9] shadow-sm'
                      : 'bg-[#FFFBF0] text-[#2B3350] border-[#EAE4D4] hover:border-[#3EC6F0]'
                  }`}
                >
                  🌟 Tất cả ({allWords.length} từ)
                </button>
                {VOCAB_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-[#3EC6F0] text-white border-[#1AA6D9] shadow-sm'
                        : 'bg-[#FFFBF0] text-[#2B3350] border-[#EAE4D4] hover:border-[#3EC6F0]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Words Grid Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border-2 border-[#EAE4D4] hover:border-[#3EC6F0] transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="bg-[#1AA6D9]/10 text-[#1AA6D9] text-xs font-black px-2.5 py-0.5 rounded-lg border border-[#1AA6D9]/25 font-mono flex items-center gap-1 shrink-0"
                          title="Số thứ tự gốc trong file 1000 từ vựng"
                        >
                          <span className="text-[10px] text-[#6B7290] font-sans font-extrabold uppercase">STT</span> #{item.id}
                        </span>
                        <span className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350]">
                          {item.word}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#1AA6D9]">
                        {item.phonetic}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => speakText(item.word, 'en-GB')}
                        className="px-2 py-1 bg-[#EAF9FF] text-[#1AA6D9] hover:bg-[#3EC6F0] hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Nghe phát âm Giọng nữ Anh-Anh (UK)"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> 🇬🇧 UK
                      </button>
                      <button
                        onClick={() => speakText(item.word, 'en-US')}
                        className="px-2 py-1 bg-[#FFF2F0] text-[#FF8C7A] hover:bg-[#FF8C7A] hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Nghe phát âm Giọng nữ Anh-Mỹ (US)"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> 🇺🇸 US
                      </button>
                      <button
                        onClick={() => {
                          saveWordToStorage({
                            word: item.word,
                            phonetic: item.phonetic,
                            vietnamese: item.vietnamese,
                            partOfSpeech: item.partOfSpeech,
                            example: `${item.exampleEn} (${item.exampleVi})`,
                          });
                          alert(`Đã lưu "${item.word}" vào Sổ Từ cá nhân!`);
                        }}
                        className="p-1.5 text-[#FFCF44] hover:bg-[#FFFBF0] rounded-full transition-all cursor-pointer"
                        title="Lưu từ vựng"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Category Tag & POS */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#EAF9FF] text-[#1AA6D9] text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-[#BEE9FF]">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-[#6B7290] uppercase">
                      ({item.partOfSpeech})
                    </span>
                  </div>

                  {/* Vietnamese Meaning Box */}
                  <div className="bg-[#FFFBF0] border border-[#FFCF44] px-3.5 py-2 rounded-2xl mb-3 flex items-center gap-2 text-sm font-extrabold text-[#2B3350]">
                    <span>🇻🇳</span>
                    <span>{item.vietnamese}</span>
                  </div>

                  {/* Example Sentences */}
                  <div className="space-y-1 text-xs font-semibold bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200">
                    <p className="text-[#2B3350] italic">
                      <span className="font-extrabold text-[#1AA6D9] not-italic">💡 Ví dụ:</span> "{item.exampleEn}"
                    </p>
                    <p className="text-[#6B7290]">👉 {item.exampleVi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className="bg-white p-12 text-center rounded-3xl border-2 border-dashed border-[#EAE4D4]">
              <p className="text-base font-bold text-[#6B7290]">Không tìm thấy từ vựng phù hợp.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 bg-[#3EC6F0] text-white text-xs font-extrabold px-4 py-2 rounded-full cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          )}
        </div>
      )}

      {/* CUSTOM WORD ADDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border-3 border-[#3EC6F0] shadow-2xl relative animate-in fade-in zoom-in">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-[#6B7290] hover:bg-gray-100 rounded-full cursor-pointer"
            >
              ✕
            </button>

            <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350] mb-1 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-[#3EC6F0]" /> Thêm Từ Vựng Học Sinh Muốn
            </h3>
            <p className="text-xs font-bold text-[#6B7290] mb-4">
              Điền từ vựng bất kỳ sinh động với nghĩa, phiên âm và ví dụ tự tạo!
            </p>

            <form onSubmit={handleAddCustomWord} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2B3350] mb-1">
                  Từ Tiếng Anh (*):
                </label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Ví dụ: Perseverance"
                  className="w-full p-3 rounded-xl border-2 border-[#EAE4D4] focus:border-[#3EC6F0] outline-none font-bold text-sm bg-[#FFFBF0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-[#2B3350] mb-1">Phiên âm IPA:</label>
                  <input
                    type="text"
                    value={newPhonetic}
                    onChange={(e) => setNewPhonetic(e.target.value)}
                    placeholder="Ví dụ: /ˌpɜː.sɪˈvɪə.rəns/"
                    className="w-full p-3 rounded-xl border-2 border-[#EAE4D4] focus:border-[#3EC6F0] outline-none font-bold text-sm bg-[#FFFBF0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#2B3350] mb-1">Chủ đề:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-[#EAE4D4] focus:border-[#3EC6F0] outline-none font-bold text-sm bg-[#FFFBF0]"
                  >
                    {VOCAB_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2B3350] mb-1">
                  Nghĩa Tiếng Việt (*):
                </label>
                <input
                  type="text"
                  required
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="Ví dụ: Sự kiên trì, sự bền bỉ"
                  className="w-full p-3 rounded-xl border-2 border-[#EAE4D4] focus:border-[#3EC6F0] outline-none font-bold text-sm bg-[#FFFBF0]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2B3350] mb-1">Ví dụ Tiếng Anh:</label>
                <input
                  type="text"
                  value={newExampleEn}
                  onChange={(e) => setNewExampleEn(e.target.value)}
                  placeholder="Ví dụ: Success requires hard work and perseverance."
                  className="w-full p-3 rounded-xl border-2 border-[#EAE4D4] focus:border-[#3EC6F0] outline-none font-bold text-sm bg-[#FFFBF0]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2B3350] mb-1">Nghĩa ví dụ Tiếng Việt:</label>
                <input
                  type="text"
                  value={newExampleVi}
                  onChange={(e) => setNewExampleVi(e.target.value)}
                  placeholder="Ví dụ: Thành công đòi hỏi sự chăm chỉ và bền bỉ."
                  className="w-full p-3 rounded-xl border-2 border-[#EAE4D4] focus:border-[#3EC6F0] outline-none font-bold text-sm bg-[#FFFBF0]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gray-100 hover:bg-gray-200 text-[#6B7290]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-[#3EC6F0] hover:bg-[#1AA6D9] text-white shadow-md cursor-pointer"
                >
                  Lưu Từ Vựng 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* GAME 2: SPEED QUIZ BLASTER                                        */}
      {/* ================================================================= */}
      {activeSubView === 'quiz' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-[#EAE4D4] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-[#EAE4D4]">
            <div>
              <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350] flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#7ED957]" /> Trắc Nghiệm Chọn Từ Nhanh
              </h3>
              <p className="text-xs text-[#6B7290] font-bold">
                Chọn từ Tiếng Anh khớp với nghĩa Tiếng Việt được đưa ra!
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#FFFBF0] px-4 py-2 rounded-2xl border-2 border-[#FFCF44] text-center">
                <span className="text-[10px] font-extrabold uppercase text-[#2B3350] block">Điểm số</span>
                <span className="font-['Baloo_2'] text-2xl font-extrabold text-[#E2A200]">{quizScore}</span>
              </div>
              <div className="bg-[#EAF9FF] px-4 py-2 rounded-2xl border-2 border-[#3EC6F0] text-center">
                <span className="text-[10px] font-extrabold uppercase text-[#1AA6D9] block">Chuỗi Streak</span>
                <span className="font-['Baloo_2'] text-2xl font-extrabold text-[#1AA6D9]">🔥 {quizStreak}</span>
              </div>
            </div>
          </div>

          {quizQuestions.length > 0 && quizIndex < quizQuestions.length ? (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-[#FFFBF0] p-6 rounded-3xl border-2 border-[#FFCF44] text-center space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#E2A200]">
                  Câu {quizIndex + 1} / {quizQuestions.length}
                </span>

                <h4 className="font-['Baloo_2'] text-3xl font-extrabold text-[#2B3350]">
                  🇻🇳 "{quizQuestions[quizIndex].word.vietnamese}"
                </h4>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => speakText(quizQuestions[quizIndex].word.word, 'en-US')}
                    className="bg-white hover:bg-gray-50 text-[#1AA6D9] border border-[#3EC6F0] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" /> Nghe phát âm mẫu
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizQuestions[quizIndex].options.map((opt, i) => {
                  let btnStyle = 'bg-white border-[#EAE4D4] hover:border-[#3EC6F0] text-[#2B3350]';
                  if (quizSelectedOption !== null) {
                    if (i === quizQuestions[quizIndex].correctIndex) {
                      btnStyle = 'bg-[#7ED957] border-[#59B639] text-white font-extrabold scale-105';
                    } else if (i === quizSelectedOption) {
                      btnStyle = 'bg-[#FF8C7A] border-[#E2604C] text-white font-extrabold';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      disabled={quizSelectedOption !== null}
                      className={`p-4 rounded-2xl border-3 text-lg font-['Baloo_2'] font-bold transition-all duration-200 cursor-pointer shadow-sm text-center ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#F2FBEF] rounded-3xl border-2 border-[#7ED957] space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-[#7ED957] rounded-full flex items-center justify-center mx-auto text-white text-3xl shadow-md">
                🎉
              </div>
              <h3 className="font-['Baloo_2'] text-3xl font-extrabold text-[#2B3350]">Hoàn Thành 10 Câu Đố!</h3>
              <p className="text-base font-bold text-[#6B7290]">
                Tổng điểm đạt được: <span className="text-[#4A9929] font-extrabold">{quizScore} điểm</span>
              </p>
              <button
                onClick={initSpeedQuiz}
                className="bg-[#7ED957] hover:bg-[#6ec248] text-white font-['Baloo_2'] font-extrabold text-lg px-8 py-3 rounded-2xl shadow-md cursor-pointer"
              >
                Chơi Đề Tiếp Theo ⚡
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* GAME 3: SPELLING BEE / TYPE THE WORD                              */}
      {/* ================================================================= */}
      {activeSubView === 'spelling' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-[#EAE4D4] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-[#EAE4D4]">
            <div>
              <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350] flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-[#FFCF44]" /> Game Gõ Từ Chính Xác
              </h3>
              <p className="text-xs text-[#6B7290] font-bold">
                Nghe phát âm hoặc nhìn nghĩa Tiếng Việt để gõ chính xác từ Tiếng Anh!
              </p>
            </div>

            <div className="bg-[#FFFBF0] px-4 py-2 rounded-2xl border-2 border-[#FFCF44] text-center">
              <span className="text-[10px] font-extrabold uppercase text-[#2B3350] block">Điểm số</span>
              <span className="font-['Baloo_2'] text-2xl font-extrabold text-[#E2A200]">{spellingScore}</span>
            </div>
          </div>

          {spellingWords.length > 0 && spellingIndex < spellingWords.length ? (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-[#FFFBF0] p-6 rounded-3xl border-2 border-[#FFCF44] text-center space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#E2A200]">
                  Từ {spellingIndex + 1} / {spellingWords.length}
                </span>

                <h4 className="font-['Baloo_2'] text-3xl font-extrabold text-[#2B3350]">
                  🇻🇳 "{spellingWords[spellingIndex].vietnamese}"
                </h4>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => speakText(spellingWords[spellingIndex].word, 'en-US')}
                    className="bg-[#3EC6F0] hover:bg-[#1AA6D9] text-white text-xs font-extrabold px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Volume2 className="w-4 h-4" /> Bấm nghe phát âm mẫu 🔊
                  </button>
                  <button
                    onClick={() => setShowHint(true)}
                    className="bg-white text-[#6B7290] border border-[#EAE4D4] hover:border-[#FFCF44] text-xs font-bold px-3 py-2 rounded-full cursor-pointer"
                  >
                    💡 Gợi ý chữ cái đầu
                  </button>
                </div>

                {showHint && (
                  <p className="text-xs font-bold text-[#E2A200]">
                    Gợi ý: Bắt đầu bằng chữ "{spellingWords[spellingIndex].word.charAt(0).toUpperCase()}" và có{' '}
                    {spellingWords[spellingIndex].word.length} chữ cái.
                  </p>
                )}
              </div>

              <form onSubmit={handleSpellingSubmit} className="space-y-4">
                <input
                  type="text"
                  value={spellingInput}
                  onChange={(e) => setSpellingInput(e.target.value)}
                  disabled={spellingSubmitted}
                  placeholder="Gõ chính xác từ Tiếng Anh vào đây..."
                  className="w-full p-4 rounded-2xl border-3 border-[#3EC6F0] focus:border-[#1AA6D9] outline-none font-['Baloo_2'] text-2xl font-extrabold text-center text-[#2B3350] bg-white shadow-inner"
                />

                {!spellingSubmitted ? (
                  <button
                    type="submit"
                    className="w-full bg-[#FFCF44] hover:bg-[#e2a200] text-[#2B3350] font-['Baloo_2'] font-extrabold text-xl py-3.5 rounded-2xl shadow-[0_4px_0_0_#E2A200] cursor-pointer transition-all"
                  >
                    Kiểm Tra Kết Quả ✍️
                  </button>
                ) : (
                  <div className="space-y-3">
                    {spellingIsCorrect ? (
                      <div className="bg-[#F2FBEF] border-2 border-[#7ED957] p-4 rounded-2xl text-center text-[#4A9929] font-extrabold text-lg flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-6 h-6" /> Chính xác tuyệt đối! (+15 điểm)
                      </div>
                    ) : (
                      <div className="bg-[#FFF0ED] border-2 border-[#FF8C7A] p-4 rounded-2xl text-center text-[#E2604C] font-bold text-sm space-y-1">
                        <p className="flex items-center justify-center gap-1 font-extrabold text-base">
                          <XCircle className="w-5 h-5" /> Chưa chính xác!
                        </p>
                        <p>
                          Đáp án đúng là:{' '}
                          <span className="font-['Baloo_2'] text-xl font-extrabold text-[#2B3350]">
                            "{spellingWords[spellingIndex].word}"
                          </span>
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={nextSpellingWord}
                      className="w-full bg-[#3EC6F0] hover:bg-[#1AA6D9] text-white font-['Baloo_2'] font-extrabold text-lg py-3.5 rounded-2xl shadow-md cursor-pointer"
                    >
                      Từ Tiếp Theo ➡️
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#FFFBF0] rounded-3xl border-2 border-[#FFCF44] space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-[#FFCF44] rounded-full flex items-center justify-center mx-auto text-[#2B3350] text-3xl shadow-md">
                ✍️
              </div>
              <h3 className="font-['Baloo_2'] text-3xl font-extrabold text-[#2B3350]">Luyện Gõ Hoàn Tất!</h3>
              <p className="text-base font-bold text-[#6B7290]">
                Tổng điểm đạt được: <span className="text-[#E2A200] font-extrabold">{spellingScore} điểm</span>
              </p>
              <button
                onClick={initSpellingBee}
                className="bg-[#FFCF44] hover:bg-[#e2a200] text-[#2B3350] font-['Baloo_2'] font-extrabold text-lg px-8 py-3 rounded-2xl shadow-md cursor-pointer"
              >
                Luyện Lại Ván Mới ✍️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* GAME 4: MASTERY EXAM CHALLENGE                                    */}
      {/* ================================================================= */}
      {activeSubView === 'exam' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-3 border-[#8B5CF6] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4 border-[#EAE4D4]">
            <div>
              <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350] flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#8B5CF6]" /> Thử Thách Kiểm Tra 1000 Từ (Mastery Exam)
              </h3>
              <p className="text-xs text-[#6B7290] font-bold">
                Bài kiểm tra toàn diện xem học sinh đã thực sự thuộc bài hay chưa!
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[10, 20, 30].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => initExam(cnt)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border cursor-pointer ${
                    examCount === cnt
                      ? 'bg-[#8B5CF6] text-white border-transparent'
                      : 'bg-[#FFFBF0] text-[#2B3350] border-[#EAE4D4]'
                  }`}
                >
                  Đề {cnt} câu
                </button>
              ))}
            </div>
          </div>

          {examQuestions.length > 0 && !examSubmitted ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase text-[#8B5CF6]">
                <span>Câu {examIndex + 1} / {examQuestions.length}</span>
                <span>Đã làm: {Object.keys(examAnswers).length} / {examQuestions.length}</span>
              </div>

              <div className="bg-[#F5F3FF] p-6 rounded-3xl border-2 border-[#C4B5FD] text-center space-y-3">
                <span className="text-xs font-extrabold text-[#8B5CF6] uppercase">Hãy chọn nghĩa đúng của từ:</span>
                <h4 className="font-['Baloo_2'] text-3xl font-extrabold text-[#2B3350]">
                  "{examQuestions[examIndex].word.word}"
                </h4>
                <p className="text-xs font-mono text-[#6B7290]">
                  {examQuestions[examIndex].word.phonetic} ({examQuestions[examIndex].word.partOfSpeech})
                </p>
                <button
                  onClick={() => speakText(examQuestions[examIndex].word.word, 'en-US')}
                  className="bg-white hover:bg-gray-50 text-[#8B5CF6] border border-[#C4B5FD] text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" /> Nghe âm thanh
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {examQuestions[examIndex].options.map((opt, optIdx) => {
                  const isSelected = examAnswers[examIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => {
                        setExamAnswers((prev) => ({ ...prev, [examIndex]: optIdx }));
                      }}
                      className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#8B5CF6] text-white border-[#7C3AED] shadow-sm'
                          : 'bg-[#FFFBF0] text-[#2B3350] border-[#EAE4D4] hover:border-[#8B5CF6]'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  disabled={examIndex === 0}
                  onClick={() => setExamIndex((i) => i - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold border border-[#EAE4D4] disabled:opacity-30 cursor-pointer"
                >
                  ⬅️ Câu Trước
                </button>

                {examIndex + 1 < examQuestions.length ? (
                  <button
                    onClick={() => setExamIndex((i) => i + 1)}
                    className="px-6 py-2.5 bg-[#8B5CF6] text-white rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    Câu Tiếp ➡️
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setExamSubmitted(true);
                      updateDailyGoalProgress('words', 10);
                    }}
                    disabled={Object.keys(examAnswers).length < examQuestions.length}
                    className="px-6 py-2.5 bg-[#7ED957] text-white rounded-xl text-xs font-extrabold cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    Nộp Bài Kiểm Tra 🏆
                  </button>
                )}
              </div>
            </div>
          ) : examSubmitted ? (
            <div className="max-w-xl mx-auto text-center space-y-6 py-6">
              {(() => {
                let correctCount = 0;
                examQuestions.forEach((q, i) => {
                  if (examAnswers[i] === q.correctIndex) correctCount++;
                });
                const percentage = Math.round((correctCount / examQuestions.length) * 100);
                let grade = 'A+';
                let gradeColor = 'text-[#7ED957]';
                if (percentage < 50) {
                  grade = 'C (Cần Cố Gắng)';
                  gradeColor = 'text-[#FF8C7A]';
                } else if (percentage < 80) {
                  grade = 'B (Khá Good)';
                  gradeColor = 'text-[#FFCF44]';
                } else if (percentage < 95) {
                  grade = 'A (Giỏi Sắc Sảo)';
                  gradeColor = 'text-[#3EC6F0]';
                }

                return (
                  <div className="space-y-6 bg-[#F5F3FF] p-8 rounded-3xl border-3 border-[#8B5CF6]">
                    <div className="w-20 h-20 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg">
                      🎓
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase text-[#8B5CF6] tracking-widest">
                        Kết Quả Kiểm Tra Thuộc Bài
                      </span>
                      <h3 className={`font-['Baloo_2'] text-4xl font-extrabold ${gradeColor} mt-1`}>
                        {grade} ({percentage}%)
                      </h3>
                      <p className="text-sm font-bold text-[#6B7290] mt-1">
                        Trả lời đúng <span className="font-extrabold text-[#2B3350]">{correctCount}</span> trên tổng số{' '}
                        <span className="font-extrabold text-[#2B3350]">{examQuestions.length}</span> câu hỏi!
                      </p>
                    </div>

                    <button
                      onClick={() => initExam(examCount)}
                      className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-['Baloo_2'] font-extrabold text-lg px-8 py-3 rounded-2xl shadow-md cursor-pointer"
                    >
                      Thử Đề Kiểm Tra Khác 🔄
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
