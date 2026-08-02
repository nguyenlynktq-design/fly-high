import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Play,
  Square,
  Globe,
  Mic,
  Sparkles,
  BookMarked,
  ArrowRightLeft,
  X,
  RotateCw,
} from 'lucide-react';
import { DictMode, DictResult, SavedWord } from '../types';
import { lookupDictionary, translateParagraph } from '../services/apiService';
import { speakText, stopSpeaking, SpeechRecognizer } from '../utils/speechUtils';
import {
  getRecentSearches,
  addRecentSearch,
  getSavedWords,
  saveWordToStorage,
  removeSavedWord,
  updateDailyGoalProgress,
} from '../utils/storageUtils';

export const DictionaryTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'word' | 'paragraph' | 'flashcards'>('word');
  const [mode, setMode] = useState<DictMode>('en2vi');
  const [searchTerm, setSearchTerm] = useState('');
  const [recent, setRecent] = useState<string[]>(getRecentSearches());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [savedWords, setSavedWords] = useState<SavedWord[]>(getSavedWords());
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Paragraph State
  const [paraText, setParaText] = useState(
    'English opens up a world of endless opportunities. Learning a new language allows you to connect with people from different cultures, express your ideas clearly, and achieve your highest goals.'
  );
  const [accent, setAccent] = useState<'en-GB' | 'en-US' | 'vi-VN'>('en-GB');
  const [speed, setSpeed] = useState(0.9);
  const [isPlayingPara, setIsPlayingPara] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [paraTranslation, setParaTranslation] = useState<{
    direction: string;
    translation: string;
    keyVocabulary?: { term: string; phonetic: string; meaning: string }[];
  } | null>(null);
  const [translatingPara, setTranslatingPara] = useState(false);

  // Mic recording for lookup
  const [isListeningMic, setIsListeningMic] = useState(false);

  const handleSearch = async (termToSearch?: string) => {
    const query = (termToSearch || searchTerm).trim();
    if (!query) return;

    setLoading(true);
    setErrorMsg(null);
    setRecent(addRecentSearch(query));

    try {
      const data = await lookupDictionary(query, mode);
      setResult(data);
      updateDailyGoalProgress('words', 1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tra từ lúc này. Vui lòng thử lại!');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    const recognizer = new SpeechRecognizer();
    if (!recognizer.isSupported) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói!');
      return;
    }
    setIsListeningMic(true);
    recognizer.start(
      (res) => {
        if (res.transcript) {
          setSearchTerm(res.transcript);
          if (res.isFinal) {
            setIsListeningMic(false);
            recognizer.stop();
            handleSearch(res.transcript);
          }
        }
      },
      () => {
        setIsListeningMic(false);
      },
      () => {
        setIsListeningMic(false);
      }
    );
  };

  const isSaved = (word: string) => savedWords.some((w) => w.word.toLowerCase() === word.toLowerCase());

  const toggleSaveWord = (res: DictResult) => {
    if (isSaved(res.word)) {
      const existing = savedWords.find((w) => w.word.toLowerCase() === res.word.toLowerCase());
      if (existing) {
        removeSavedWord(existing.id);
        setSavedWords(getSavedWords());
      }
    } else {
      saveWordToStorage({
        word: res.word,
        phonetic: res.phonetic,
        vietnamese: res.vietnamese,
        partOfSpeech: res.partOfSpeech,
        example: res.examples?.[0] || '',
      });
      setSavedWords(getSavedWords());
    }
  };

  // Paragraph playback logic
  const handlePlayParagraph = async () => {
    if (!paraText.trim()) return;
    setIsPlayingPara(true);

    const words = paraText.split(/\s+/);

    await speakText(
      paraText,
      accent,
      speed,
      (charIndex) => {
        // Approximate active word index
        let charAcc = 0;
        for (let i = 0; i < words.length; i++) {
          charAcc += words[i].length + 1;
          if (charAcc >= charIndex) {
            setActiveWordIndex(i);
            break;
          }
        }
      },
      () => {
        setIsPlayingPara(false);
        setActiveWordIndex(null);
      }
    );
  };

  const handleStopParagraph = () => {
    stopSpeaking();
    setIsPlayingPara(false);
    setActiveWordIndex(null);
  };

  const handleTranslateParagraph = async () => {
    if (!paraText.trim()) return;
    setTranslatingPara(true);
    try {
      const res = await translateParagraph(paraText);
      setParaTranslation(res);
    } catch (err) {
      alert('Không thể dịch đoạn văn. Vui lòng thử lại!');
    } finally {
      setTranslatingPara(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-10">
      {/* Sub Tabs Toggle */}
      <div className="flex justify-center border-b border-[#EAE4D4] mb-6">
        <button
          onClick={() => setSubTab('word')}
          className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 ${
            subTab === 'word'
              ? 'border-[#3EC6F0] text-[#1AA6D9]'
              : 'border-transparent text-[#6B7290] hover:text-[#2B3350]'
          }`}
        >
          <Search className="w-4 h-4" /> Tra Từ &amp; Cụm Từ
        </button>
        <button
          onClick={() => setSubTab('paragraph')}
          className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 ${
            subTab === 'paragraph'
              ? 'border-[#FF8C7A] text-[#FF8C7A]'
              : 'border-transparent text-[#6B7290] hover:text-[#2B3350]'
          }`}
        >
          <Volume2 className="w-4 h-4" /> Đọc Đoạn Văn
        </button>
        <button
          onClick={() => setSubTab('flashcards')}
          className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 relative ${
            subTab === 'flashcards'
              ? 'border-[#FFCF44] text-[#E2A200]'
              : 'border-transparent text-[#6B7290] hover:text-[#2B3350]'
          }`}
        >
          <BookMarked className="w-4 h-4" /> Sổ Từ Vựng
          {savedWords.length > 0 && (
            <span className="bg-[#FF8C7A] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {savedWords.length}
            </span>
          )}
        </button>
      </div>

      {/* ================= SUB TAB 1: WORD LOOKUP ================= */}
      {subTab === 'word' && (
        <div>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* EN-VI Mode Toggle */}
            <div className="flex bg-white p-1 rounded-full border-2 border-[#EAE4D4] shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setMode('en2vi')}
                className={`px-4 py-2 rounded-full font-['Baloo_2'] font-bold text-sm transition-all ${
                  mode === 'en2vi' ? 'bg-[#FFCF44] text-[#2B3350] shadow-sm' : 'text-[#6B7290]'
                }`}
              >
                Anh → Việt
              </button>
              <button
                onClick={() => setMode('vi2en')}
                className={`px-4 py-2 rounded-full font-['Baloo_2'] font-bold text-sm transition-all ${
                  mode === 'vi2en' ? 'bg-[#FFCF44] text-[#2B3350] shadow-sm' : 'text-[#6B7290]'
                }`}
              >
                Việt → Anh
              </button>
            </div>

            {/* Input & Search Button */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={
                    mode === 'en2vi'
                      ? 'Nhập từ tiếng Anh (ví dụ: perseverance, elephant)...'
                      : 'Nhập từ tiếng Việt (ví dụ: kiên trì, con voi)...'
                  }
                  className="w-full py-3.5 pl-5 pr-11 rounded-full border-3 border-[#EAE4D4] focus:border-[#3EC6F0] outline-none font-bold text-base bg-white shadow-sm transition-all"
                />
                <button
                  onClick={handleVoiceSearch}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                    isListeningMic ? 'bg-red-500 text-white animate-bounce' : 'text-[#6B7290] hover:text-[#3EC6F0]'
                  }`}
                  title="Tìm bằng giọng nói"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-[#7ED957] hover:bg-[#6ec248] active:translate-y-0.5 text-white font-['Baloo_2'] font-bold px-6 py-3.5 rounded-full shadow-[0_4px_0_0_#59B639] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Tra Từ</span>
              </button>
            </div>
          </div>

          {/* Recent Searches */}
          {recent.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-[#6B7290]">Vừa tra:</span>
              {recent.map((term, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchTerm(term);
                    handleSearch(term);
                  }}
                  className="bg-white hover:border-[#3EC6F0] text-[#6B7290] hover:text-[#1AA6D9] text-xs font-bold px-3 py-1.5 rounded-full border border-[#EAE4D4] shadow-xs transition-all cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-3xl p-10 text-center border-3 border-[#EAE4D4] shadow-sm my-6">
              <div className="w-10 h-10 border-4 border-[#EAE4D4] border-t-[#3EC6F0] rounded-full animate-spin mx-auto mb-3" />
              <p className="font-bold text-[#6B7290]">Đang tra từ cùng AI Ms Lý AI...</p>
            </div>
          )}

          {/* Error State */}
          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-3xl p-6 text-center my-6 font-bold">
              {errorMsg}
            </div>
          )}

          {/* Empty Placeholder */}
          {!loading && !result && !errorMsg && (
            <div className="bg-white rounded-3xl p-10 text-center border-3 border-[#EAE4D4] shadow-sm my-6">
              <span className="text-5xl block mb-3">🐝</span>
              <h3 className="font-['Baloo_2'] text-xl font-bold text-[#2B3350]">Tra từ vựng chuẩn xác</h3>
              <p className="text-sm text-[#6B7290] font-semibold mt-1">
                Gõ một từ/cụm từ bất kỳ để xem phiên âm IPA, âm thanh Anh-Anh/Anh-Mỹ, nghĩa tiếng Việt &amp; ví dụ phong phú!
              </p>
            </div>
          )}

          {/* Result Card */}
          {result && !loading && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#EAE4D4] shadow-[0_6px_0_0_#EAE4D4] my-6">
              {/* Head Section */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#EAE4D4]">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-['Baloo_2'] text-3xl sm:text-4xl font-extrabold text-[#2B3350]">
                      {result.word}
                    </h2>
                    {result.partOfSpeech && (
                      <span className="bg-[#6B7290] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {result.partOfSpeech}
                      </span>
                    )}
                  </div>
                  {result.phonetic && (
                    <p className="text-base text-[#1AA6D9] font-bold mt-1 tracking-wide font-mono">
                      {result.phonetic}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(result.word, 'en-GB')}
                    className="bg-[#3EC6F0] hover:bg-[#1AA6D9] text-white font-['Baloo_2'] font-bold text-xs px-3.5 py-2 rounded-full shadow-[0_3px_0_0_#1AA6D9] transition-all flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                    title="Nghe giọng nữ Anh - Anh bản ngữ (UK)"
                  >
                    <Volume2 className="w-4 h-4" /> 🇬🇧 UK (Nữ)
                  </button>
                  <button
                    onClick={() => speakText(result.word, 'en-US')}
                    className="bg-[#FF8C7A] hover:bg-[#E2604C] text-white font-['Baloo_2'] font-bold text-xs px-3.5 py-2 rounded-full shadow-[0_3px_0_0_#E2604C] transition-all flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                    title="Nghe giọng nữ Anh - Mỹ bản ngữ (US)"
                  >
                    <Volume2 className="w-4 h-4" /> 🇺🇸 US (Nữ)
                  </button>

                  <button
                    onClick={() => toggleSaveWord(result)}
                    className={`p-2.5 rounded-full border-2 transition-all cursor-pointer ${
                      isSaved(result.word)
                        ? 'bg-[#FFCF44] border-[#E2A200] text-[#2B3350]'
                        : 'bg-white border-[#EAE4D4] text-[#6B7290] hover:text-[#1AA6D9]'
                    }`}
                    title={isSaved(result.word) ? 'Đã lưu trong sổ từ' : 'Lưu vào sổ từ vựng'}
                  >
                    {isSaved(result.word) ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Vietnamese Meaning Banner */}
              <div className="my-5 bg-[#FFF7DE] border-2 border-dashed border-[#FFCF44] rounded-2xl p-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#B8860B] block mb-1">
                  Nghĩa Tiếng Việt
                </span>
                <p className="font-['Baloo_2'] text-2xl font-bold text-[#2B3350]">{result.vietnamese}</p>
              </div>

              {/* Definitions */}
              {result.definitions?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#6B7290] mb-2">
                    Định Nghĩa Tiếng Anh
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-base font-semibold text-[#2B3350]">
                    {result.definitions.map((def, i) => (
                      <li key={i}>{def}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              {result.examples?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#6B7290] mb-2">
                    Ví Dụ Thực Tế
                  </h4>
                  <div className="space-y-2">
                    {result.examples.map((ex, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold text-[#2B3350]">
                        <span>"{ex}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collocations & Synonyms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#EAE4D4]">
                {result.collocations && result.collocations.length > 0 && (
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-widest text-[#1AA6D9] mb-2">
                      Cụm Từ Đi Kèm (Collocations)
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {result.collocations.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => speakText(c, 'en-US')}
                          className="bg-[#EAF9FF] hover:bg-[#3EC6F0] hover:text-white text-[#1AA6D9] text-xs font-bold px-3 py-1 rounded-full border border-[#BEE9FF] transition-all flex items-center gap-1 cursor-pointer"
                          title="Nghe phát âm chuẩn tiếng Anh"
                        >
                          <Volume2 className="w-3 h-3" /> {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {result.synonyms && result.synonyms.length > 0 && (
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-widest text-[#7ED957] mb-2">
                      Từ Đồng Nghĩa (Synonyms)
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {result.synonyms.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => speakText(s, 'en-US')}
                          className="bg-[#F2FBEF] hover:bg-[#7ED957] hover:text-white text-[#4A9929] text-xs font-bold px-3 py-1 rounded-full border border-[#C6EEB8] transition-all flex items-center gap-1 cursor-pointer"
                          title="Nghe phát âm chuẩn tiếng Anh"
                        >
                          <Volume2 className="w-3 h-3" /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SUB TAB 2: PARAGRAPH READER ================= */}
      {subTab === 'paragraph' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-3 border-[#EAE4D4] shadow-sm">
            <label className="block font-['Baloo_2'] text-lg font-bold text-[#2B3350] mb-2">
              Dán đoạn văn tiếng Anh/Việt vào đây để đọc to &amp; học phát âm:
            </label>
            <textarea
              value={paraText}
              onChange={(e) => setParaText(e.target.value)}
              rows={4}
              placeholder="Dán đoạn văn tiếng Anh hoặc tiếng Việt vào đây..."
              className="w-full p-4 rounded-2xl border-2 border-[#EAE4D4] focus:border-[#FF8C7A] outline-none font-semibold text-base resize-y bg-[#FFFBF0]"
            />

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
              {/* Accent Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6B7290]">Giọng đọc:</span>
                <button
                  onClick={() => setAccent('en-GB')}
                  className={`px-3 py-1.5 rounded-full font-bold text-xs border transition-all ${
                    accent === 'en-GB' ? 'bg-[#3EC6F0] text-white border-[#1AA6D9]' : 'bg-white text-[#6B7290] border-[#EAE4D4]'
                  }`}
                >
                  🇬🇧 Anh
                </button>
                <button
                  onClick={() => setAccent('en-US')}
                  className={`px-3 py-1.5 rounded-full font-bold text-xs border transition-all ${
                    accent === 'en-US' ? 'bg-[#FF8C7A] text-white border-[#E2604C]' : 'bg-white text-[#6B7290] border-[#EAE4D4]'
                  }`}
                >
                  🇺🇸 Mỹ
                </button>
                <button
                  onClick={() => setAccent('vi-VN')}
                  className={`px-3 py-1.5 rounded-full font-bold text-xs border transition-all ${
                    accent === 'vi-VN' ? 'bg-[#FFCF44] text-[#2B3350] border-[#E2A200]' : 'bg-white text-[#6B7290] border-[#EAE4D4]'
                  }`}
                >
                  🇻🇳 Việt
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-2 text-xs font-bold text-[#6B7290]">
                <span>Tốc độ:</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.3"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="accent-[#FF8C7A] w-24 cursor-pointer"
                />
                <span className="w-8 font-mono">{speed}x</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isPlayingPara ? (
                  <button
                    onClick={handlePlayParagraph}
                    className="bg-[#7ED957] hover:bg-[#6ec248] text-white font-['Baloo_2'] font-bold px-5 py-2.5 rounded-full shadow-[0_3px_0_0_#59B639] transition-all flex items-center gap-2 cursor-pointer active:translate-y-0.5"
                  >
                    <Play className="w-4 h-4 fill-current" /> Đọc To
                  </button>
                ) : (
                  <button
                    onClick={handleStopParagraph}
                    className="bg-red-500 hover:bg-red-600 text-white font-['Baloo_2'] font-bold px-5 py-2.5 rounded-full shadow-[0_3px_0_0_#b91c1c] transition-all flex items-center gap-2 cursor-pointer active:translate-y-0.5 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" /> Dừng
                  </button>
                )}

                <button
                  onClick={handleTranslateParagraph}
                  disabled={translatingPara}
                  className="bg-white hover:bg-gray-50 text-[#1AA6D9] border-2 border-[#3EC6F0] font-['Baloo_2'] font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Globe className="w-4 h-4" /> {translatingPara ? 'Đang dịch...' : 'Dịch Đoạn'}
                </button>
              </div>
            </div>
          </div>

          {/* Reading Stage */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#EAE4D4] shadow-[0_6px_0_0_#EAE4D4] min-h-[120px] relative leading-loose text-lg font-semibold text-[#2B3350]">
            {paraText.split(/\s+/).map((word, idx) => (
              <span
                key={idx}
                className={`inline-block mx-1 px-1.5 py-0.5 rounded-md transition-all duration-150 ${
                  activeWordIndex === idx ? 'bg-[#FFCF44] text-[#2B3350] font-extrabold scale-110 shadow-sm' : ''
                }`}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Translation Result Card */}
          {paraTranslation && (
            <div className="bg-[#EAF9FF] border-2 border-dashed border-[#3EC6F0] rounded-3xl p-6">
              <h4 className="font-['Baloo_2'] text-base font-bold text-[#1AA6D9] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5" /> Bản Dịch AI Đoạn Văn
              </h4>
              <p className="text-base font-bold text-[#2B3350] leading-relaxed mb-4">{paraTranslation.translation}</p>

              {paraTranslation.keyVocabulary && paraTranslation.keyVocabulary.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#BEE9FF]">
                  <h5 className="text-xs font-extrabold uppercase tracking-widest text-[#1AA6D9] mb-2">
                    Từ vựng cốt lõi trong đoạn:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {paraTranslation.keyVocabulary.map((kv, i) => (
                      <div key={i} className="bg-white p-3 rounded-2xl border border-[#BEE9FF] text-xs font-semibold flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-[#2B3350] text-sm">{kv.term}</span>{' '}
                          {kv.phonetic && <span className="text-[#1AA6D9] font-mono text-xs">{kv.phonetic}</span>}
                          <p className="text-[#6B7290] mt-0.5 font-medium">🇻🇳 {kv.meaning}</p>
                        </div>
                        <button
                          onClick={() => speakText(kv.term, 'en-US')}
                          className="p-1.5 text-[#1AA6D9] hover:bg-[#EAF9FF] rounded-full shrink-0 cursor-pointer"
                          title="Nghe phát âm tiếng Anh chuẩn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= SUB TAB 3: FLASHCARDS / SAVED WORDS ================= */}
      {subTab === 'flashcards' && (
        <div>
          {savedWords.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border-3 border-[#EAE4D4] shadow-sm my-6">
              <BookMarked className="w-12 h-12 text-[#FFCF44] mx-auto mb-3" />
              <h3 className="font-['Baloo_2'] text-xl font-bold text-[#2B3350]">Sổ Từ Vựng Trống</h3>
              <p className="text-sm text-[#6B7290] font-semibold mt-1">
                Hãy bấm nút Bookmark biểu tượng thẻ nhớ khi tra từ để lưu các từ yêu thích vào đây nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Flashcard Component */}
              <div className="bg-[#FFFBF0] rounded-3xl p-8 border-3 border-[#FFCF44] shadow-[0_6px_0_0_#FFCF44] text-center max-w-lg mx-auto relative min-h-[260px] flex flex-col justify-between">
                <div className="text-xs font-extrabold text-[#E2A200] uppercase tracking-widest mb-2">
                  Thẻ Ôn Tập ({flashcardIndex + 1} / {savedWords.length})
                </div>

                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer py-6 group my-auto transition-transform active:scale-98"
                >
                  {!isFlipped ? (
                    <div>
                      <h2 className="font-['Baloo_2'] text-4xl font-extrabold text-[#2B3350] mb-2">
                        {savedWords[flashcardIndex].word}
                      </h2>
                      <p className="text-base text-[#1AA6D9] font-mono font-bold">
                        {savedWords[flashcardIndex].phonetic}
                      </p>
                      <p className="text-xs text-[#6B7290] mt-4 italic">Chạm vào đây để xem nghĩa tiếng Việt 🔄</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-['Baloo_2'] text-3xl font-extrabold text-[#FF8C7A] mb-2">
                        {savedWords[flashcardIndex].vietnamese}
                      </h3>
                      {savedWords[flashcardIndex].example && (
                        <p className="text-sm font-semibold text-[#2B3350] bg-white p-3 rounded-2xl border border-[#EAE4D4] mt-3">
                          "{savedWords[flashcardIndex].example}"
                        </p>
                      )}
                      <p className="text-xs text-[#6B7290] mt-4 italic">Chạm lần nữa để lật lại 🔄</p>
                    </div>
                  )}
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-[#EAE4D4]">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : savedWords.length - 1));
                    }}
                    className="bg-white hover:bg-gray-50 text-[#2B3350] font-bold text-xs px-4 py-2 rounded-full border border-[#EAE4D4]"
                  >
                    ← Từ trước
                  </button>

                  <button
                    onClick={() => speakText(savedWords[flashcardIndex].word, 'en-US')}
                    className="p-2 rounded-full bg-[#3EC6F0] text-white hover:bg-[#1AA6D9]"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIndex((prev) => (prev < savedWords.length - 1 ? prev + 1 : 0));
                    }}
                    className="bg-white hover:bg-gray-50 text-[#2B3350] font-bold text-xs px-4 py-2 rounded-full border border-[#EAE4D4]"
                  >
                    Từ sau →
                  </button>
                </div>
              </div>

              {/* Saved Word List Table */}
              <div className="bg-white rounded-3xl p-6 border-3 border-[#EAE4D4] shadow-sm">
                <h4 className="font-['Baloo_2'] text-lg font-bold text-[#2B3350] mb-4">
                  Danh sách từ đã lưu ({savedWords.length})
                </h4>
                <div className="divide-y divide-gray-100">
                  {savedWords.map((w) => (
                    <div key={w.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-base text-[#2B3350]">{w.word}</span>{' '}
                        <span className="text-xs text-[#1AA6D9] font-mono">{w.phonetic}</span>
                        <p className="text-xs font-semibold text-[#6B7290]">{w.vietnamese}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(w.word, 'en-US')}
                          className="p-2 text-[#3EC6F0] hover:bg-blue-50 rounded-full"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            removeSavedWord(w.id);
                            setSavedWords(getSavedWords());
                          }}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
