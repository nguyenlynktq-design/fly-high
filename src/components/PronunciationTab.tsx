import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle, AlertTriangle, Play, Square, RotateCcw } from 'lucide-react';
import { PronunciationAnalysis } from '../types';
import { evaluatePronunciation } from '../services/apiService';
import { speakText, SpeechRecognizer } from '../utils/speechUtils';
import { updateDailyGoalProgress } from '../utils/storageUtils';

export const PronunciationTab: React.FC = () => {
  const [practiceMode, setPracticeMode] = useState<'word' | 'sentence' | 'free'>('sentence');
  const [targetText, setTargetText] = useState('Welcome to Ms Lý AI. Keep practising every single day!');
  const [customText, setCustomText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);

  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // Sample Practice Prompts
  const sampleWords = [
    { word: 'Perseverance', ipa: '/ˌpɜː.sɪˈvɪə.rəns/', meaning: 'Sự kiên trì' },
    { word: 'Extraordinary', ipa: '/ɪkˈstrɔː.dɪn.ər.i/', meaning: 'Phi thường' },
    { word: 'Comfortable', ipa: '/ˈkʌm.fə.tə.bəl/', meaning: 'Thoải mái' },
    { word: 'Pronunciation', ipa: '/prəˌnʌn.siˈeɪ.ʃən/', meaning: 'Sự phát âm' },
    { word: 'Schedule', ipa: '/ˈʃed.juːl/', meaning: 'Lịch trình' },
  ];

  const sampleSentences = [
    'Welcome to Ms Lý AI. Keep practising every single day!',
    'Could you please give me a hand with this task?',
    'I am looking forward to hearing from you soon.',
    'It is a beautiful day to learn something new.',
    'Practice makes perfect, so never give up on your dreams!',
  ];

  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();
  }, []);

  const startRecording = () => {
    if (!recognizerRef.current?.isSupported) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API!');
      return;
    }

    setRecognizedText('');
    setAnalysis(null);
    setIsRecording(true);

    recognizerRef.current.start(
      (res) => {
        setRecognizedText(res.transcript);
      },
      (err) => {
        console.warn('Rec error:', err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );
  };

  const stopRecordingAndEvaluate = async () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);

    const activeTarget = practiceMode === 'free' ? customText || 'Free speech' : targetText;
    const spoken = recognizedText.trim() || 'No speech detected';

    setLoading(true);
    try {
      const res = await evaluatePronunciation(activeTarget, spoken);
      setAnalysis(res);
      updateDailyGoalProgress('speaking', 1);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi chấm điểm phát âm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-12">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 border-3 border-[#EAE4D4] shadow-sm mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#EAF9FF] text-[#1AA6D9] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-2">
          <Mic className="w-4 h-4" /> AI Speech Recognition &amp; Accent Assessor
        </div>
        <h2 className="font-['Baloo_2'] text-2xl sm:text-3xl font-extrabold text-[#2B3350]">
          Ghi Âm &amp; Chấm Điểm Phát Âm Chuẩn Giọng Bản Xứ
        </h2>
        <p className="text-sm text-[#6B7290] font-semibold mt-1 max-w-xl mx-auto">
          Thu âm trực tiếp lời nói của bạn qua microphone. Công nghệ AI sẽ phân tích độ chính xác từ âm tiết, trọng âm, âm đuôi và ngữ điệu câu!
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => {
            setPracticeMode('sentence');
            setTargetText(sampleSentences[0]);
            setAnalysis(null);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm border-2 transition-all ${
            practiceMode === 'sentence'
              ? 'bg-[#7ED957] text-white border-[#59B639] shadow-sm'
              : 'bg-white text-[#6B7290] border-[#EAE4D4]'
          }`}
        >
          💬 Luyện Theo Câu
        </button>
        <button
          onClick={() => {
            setPracticeMode('word');
            setTargetText(sampleWords[0].word);
            setAnalysis(null);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm border-2 transition-all ${
            practiceMode === 'word'
              ? 'bg-[#3EC6F0] text-white border-[#1AA6D9] shadow-sm'
              : 'bg-white text-[#6B7290] border-[#EAE4D4]'
          }`}
        >
          🎯 Luyện Từ Khó
        </button>
        <button
          onClick={() => {
            setPracticeMode('free');
            setAnalysis(null);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm border-2 transition-all ${
            practiceMode === 'free'
              ? 'bg-[#FFCF44] text-[#2B3350] border-[#E2A200] shadow-sm'
              : 'bg-white text-[#6B7290] border-[#EAE4D4]'
          }`}
        >
          🎤 Nói Tự Do
        </button>
      </div>

      {/* Target Content Selection */}
      <div className="bg-white rounded-3xl p-6 border-3 border-[#EAE4D4] shadow-[0_6px_0_0_#EAE4D4] mb-8">
        {practiceMode === 'sentence' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1AA6D9] mb-1.5 flex items-center justify-between">
                <span>✍️ Ô Nhập Câu Bạn Muốn Luyện Phát Âm:</span>
                <span className="text-[11px] font-normal text-[#6B7290] normal-case">Tự do gõ hoặc chọn gợi ý bên dưới</span>
              </label>
              <input
                type="text"
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                placeholder="Nhập bất kỳ câu tiếng Anh nào bạn muốn luyện phát âm..."
                className="w-full p-4 rounded-2xl border-2 border-[#3EC6F0] focus:border-[#1AA6D9] outline-none font-bold text-base text-[#2B3350] bg-[#FFFBF0] shadow-inner"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-[#6B7290] uppercase tracking-wider mb-2">
                💡 Hoặc chọn nhanh từ danh sách câu mẫu:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {sampleSentences.map((st, i) => (
                  <div
                    key={i}
                    onClick={() => setTargetText(st)}
                    className={`p-3 rounded-2xl text-left text-sm font-bold border transition-all cursor-pointer flex items-center justify-between ${
                      targetText === st
                        ? 'bg-[#EAF9FF] text-[#1AA6D9] border-[#3EC6F0]'
                        : 'bg-[#FFFBF0] text-[#2B3350] border-[#EAE4D4] hover:border-[#3EC6F0]'
                    }`}
                  >
                    <span>"{st}"</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(st, 'en-US');
                      }}
                      className="p-1 text-[#1AA6D9] hover:scale-110 cursor-pointer"
                      title="Nghe mẫu tiếng Anh"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {practiceMode === 'word' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1AA6D9] mb-1.5 flex items-center justify-between">
                <span>✍️ Ô Nhập Từ Vựng Bạn Muốn Luyện Phát Âm:</span>
                <span className="text-[11px] font-normal text-[#6B7290] normal-case">Tự do gõ từ vựng bất kỳ</span>
              </label>
              <input
                type="text"
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                placeholder="Nhập từ vựng tiếng Anh bất kỳ (ví dụ: Extraordinary, Schedule)..."
                className="w-full p-4 rounded-2xl border-2 border-[#3EC6F0] focus:border-[#1AA6D9] outline-none font-bold text-base text-[#2B3350] bg-[#FFFBF0] shadow-inner"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-[#6B7290] uppercase tracking-wider mb-2">
                💡 Hoặc chọn nhanh các từ vựng khó mẫu:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleWords.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => setTargetText(w.word)}
                    className={`px-4 py-2 rounded-2xl font-bold text-sm border transition-all cursor-pointer ${
                      targetText === w.word
                        ? 'bg-[#3EC6F0] text-white border-[#1AA6D9] shadow-sm'
                        : 'bg-[#FFFBF0] text-[#2B3350] border-[#EAE4D4]'
                    }`}
                  >
                    {w.word} <span className="text-xs font-mono font-normal">({w.ipa})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {practiceMode === 'free' && (
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#1AA6D9] mb-1">
              ✍️ Ô Nhập Đoạn Văn / Bài Nói Tự Do Bạn Điền:
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
              placeholder="Nhập đoạn văn, bài phát biểu hoặc suy nghĩ tiếng Anh bất kỳ bạn muốn thu âm..."
              className="w-full p-4 rounded-2xl border-2 border-[#3EC6F0] focus:border-[#1AA6D9] outline-none font-bold text-base bg-[#FFFBF0] text-[#2B3350]"
            />
          </div>
        )}

        {/* Display Target & Native Preview */}
        <div className="mt-6 p-6 bg-[#FFFBF0] border-2 border-[#FFCF44] rounded-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E2A200] block mb-1">
            Văn Bản Học Sinh Đã Điền / Chọn Cần Đọc:
          </span>
          
          <input
            type="text"
            value={practiceMode === 'free' ? customText : targetText}
            onChange={(e) => {
              if (practiceMode === 'free') {
                setCustomText(e.target.value);
              } else {
                setTargetText(e.target.value);
              }
            }}
            placeholder="Chưa có văn bản... Hãy nhập văn bản vào đây"
            className="w-full text-center font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350] bg-white border border-[#FFCF44] rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#FFCF44] my-1"
          />

          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <button
              onClick={() => speakText(practiceMode === 'free' ? customText : targetText, 'en-GB')}
              className="bg-white hover:bg-[#EAF9FF] text-[#1AA6D9] border-2 border-[#3EC6F0] text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Volume2 className="w-4 h-4" /> 🇬🇧 Nghe Giọng Nữ Anh - Anh (UK)
            </button>
            <button
              onClick={() => speakText(practiceMode === 'free' ? customText : targetText, 'en-US')}
              className="bg-white hover:bg-[#FFF2F0] text-[#FF8C7A] border-2 border-[#FF8C7A] text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Volume2 className="w-4 h-4" /> 🇺🇸 Nghe Giọng Nữ Anh - Mỹ (US)
            </button>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="mt-8 text-center flex flex-col items-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-[#7ED957] hover:bg-[#6ec248] text-white p-6 rounded-full shadow-[0_6px_0_0_#59B639] transition-all cursor-pointer hover:scale-105 active:translate-y-1 group"
            >
              <Mic className="w-10 h-10 group-hover:animate-pulse" />
            </button>
          ) : (
            <button
              onClick={stopRecordingAndEvaluate}
              className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-full shadow-[0_6px_0_0_#b91c1c] transition-all cursor-pointer animate-bounce"
            >
              <Square className="w-10 h-10 fill-current" />
            </button>
          )}

          <span className="text-sm font-bold text-[#2B3350] mt-3 block">
            {isRecording
              ? '🔴 Đang ghi âm... Nhấn nút vuông đỏ khi nói xong để AI chấm điểm!'
              : 'Bấm micro xanh để bắt đầu ghi âm phát âm'}
          </span>

          {/* Real-time Recognized Stream */}
          {recognizedText && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-lg text-sm font-bold text-[#2B3350]">
              <span className="text-xs text-[#6B7290] font-semibold block mb-1">Lời nói vừa thu âm:</span>
              "{recognizedText}"
            </div>
          )}
        </div>
      </div>

      {/* Loading Evaluation */}
      {loading && (
        <div className="bg-white rounded-3xl p-10 text-center border-3 border-[#EAE4D4] shadow-sm my-6">
          <div className="w-12 h-12 border-4 border-[#EAE4D4] border-t-[#7ED957] rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold text-[#2B3350] text-lg">AI Ms Lý AI đang chấm điểm phát âm &amp; ngữ điệu...</p>
        </div>
      )}

      {/* Evaluation Analysis Results */}
      {analysis && !loading && (
        <div className="space-y-6">
          {/* Main Score Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#7ED957] shadow-[0_6px_0_0_#7ED957]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#EAE4D4]">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#59B639] block mb-1">
                  Kết Quả Chấm Điểm Phát Âm AI
                </span>
                <h3 className="font-['Baloo_2'] text-2xl font-bold text-[#2B3350]">
                  {analysis.overallScore >= 85
                    ? '🎉 Phát âm cực chuẩn bản xứ!'
                    : analysis.overallScore >= 70
                    ? '👏 Phát âm tốt, chỉ cần chỉnh chút âm tiết'
                    : '💪 Hãy tiếp tục luyện tập để bật âm chuẩn hơn!'}
                </h3>
                <p className="text-sm font-semibold text-[#6B7290] mt-1">{analysis.nativeSpeakerTipVi}</p>
              </div>

              {/* Overall Score Circle */}
              <div className="flex flex-col items-center justify-center bg-[#7ED957] text-white px-6 py-4 rounded-3xl shadow-sm shrink-0">
                <span className="text-xs font-extrabold uppercase tracking-wider">Điểm Phát Âm</span>
                <span className="font-['Baloo_2'] text-4xl font-extrabold">{analysis.overallScore}</span>
                <span className="text-[10px] font-bold">/ 100</span>
              </div>
            </div>

            {/* Sub-scores Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-[#FFFBF0] p-3 rounded-2xl border border-[#EAE4D4] text-center">
                <span className="text-xs font-bold text-[#6B7290] block">Chính Xác Âm</span>
                <span className="font-bold text-lg text-[#1AA6D9]">{analysis.accuracyScore}/100</span>
              </div>
              <div className="bg-[#FFFBF0] p-3 rounded-2xl border border-[#EAE4D4] text-center">
                <span className="text-xs font-bold text-[#6B7290] block">Độ Trôi Chảy</span>
                <span className="font-bold text-lg text-[#7ED957]">{analysis.fluencyScore}/100</span>
              </div>
              <div className="bg-[#FFFBF0] p-3 rounded-2xl border border-[#EAE4D4] text-center">
                <span className="text-xs font-bold text-[#6B7290] block">Ngữ Điệu &amp; Trọng Âm</span>
                <span className="font-bold text-lg text-[#FF8C7A]">{analysis.intonationScore}/100</span>
              </div>
            </div>
          </div>

          {/* Word-by-Word Color Breakdown */}
          {analysis.wordFeedback && analysis.wordFeedback.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border-3 border-[#EAE4D4] shadow-sm">
              <h4 className="font-['Baloo_2'] text-lg font-bold text-[#2B3350] mb-3">
                Chi Tiết Từng Từ Trong Câu (Bấm vào từ để xem mẹo):
              </h4>

              <div className="flex flex-wrap gap-2 mb-6">
                {analysis.wordFeedback.map((wf, i) => {
                  const isPerfect = wf.status === 'perfect';
                  const isGood = wf.status === 'good';
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isPerfect
                          ? 'bg-green-50 border-green-300 text-green-800'
                          : isGood
                          ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                          : 'bg-red-50 border-red-300 text-red-800'
                      }`}
                    >
                      <span className="font-extrabold text-base block">{wf.word}</span>
                      {wf.expectedIpa && <span className="text-[11px] font-mono block text-[#1AA6D9]">{wf.expectedIpa}</span>}
                      <span className="text-[10px] font-bold block mt-1">
                        {isPerfect ? '🟢 Chuẩn 100%' : isGood ? '🟡 Khá tốt' : '🔴 Cần luyện'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Word Specific Tips */}
              <div className="space-y-2">
                {analysis.wordFeedback.map(
                  (wf, i) =>
                    wf.tipVi && (
                      <div key={i} className="text-xs font-semibold text-[#2B3350] bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <span className="font-bold text-[#1AA6D9]">"{wf.word}"</span>: {wf.tipVi}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Phonetic & Mouth Position Advice */}
          {analysis.phoneticTipsVi && analysis.phoneticTipsVi.length > 0 && (
            <div className="bg-[#EAF9FF] rounded-3xl p-6 border-2 border-[#3EC6F0]">
              <h4 className="font-['Baloo_2'] text-lg font-bold text-[#1AA6D9] mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Mẹo Mở Khẩu Hình Môi-Lưỡi &amp; Nối Âm Bản Xứ
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-sm font-semibold text-[#2B3350]">
                {analysis.phoneticTipsVi.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
