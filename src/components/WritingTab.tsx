import React, { useState } from 'react';
import { PenTool, Sparkles, CheckCircle2, AlertCircle, Volume2, Copy, ArrowRight, MessageSquareCode, BookOpen, Lightbulb, HelpCircle } from 'lucide-react';
import { WritingAnalysis, DebateSuggestionResponse, DebateSuggestionItem } from '../types';
import { correctWriting, suggestDebateAnswers } from '../services/apiService';
import { speakText } from '../utils/speechUtils';
import { updateDailyGoalProgress, saveWordToStorage } from '../utils/storageUtils';

export const WritingTab: React.FC = () => {
  const [activeTabMode, setActiveTabMode] = useState<'standard' | 'debate'>('standard');
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('Tự do');
  const [tone, setTone] = useState('Tự nhiên bản xứ');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [copied, setCopied] = useState(false);

  // Guided Debate 3-Step States & Stance (Agree vs Disagree / Counter-Opinion)
  const [debateTopicInput, setDebateTopicInput] = useState('Chó tốt hơn mèo làm thú cưng (Dogs are better pets than cats)');
  const [debateStance, setDebateStance] = useState<'agree' | 'disagree'>('agree');

  const [opinionStarter, setOpinionStarter] = useState('In my opinion,');
  const [opinionText, setOpinionText] = useState('');
  const [reasonStarter, setReasonStarter] = useState('because');
  const [reasonText, setReasonText] = useState('');
  const [exampleStarter, setExampleStarter] = useState('For example,');
  const [exampleText, setExampleText] = useState('');

  // Starters Configuration based on Stance
  const agreeOpinionStarters = [
    { value: 'In my opinion,', label: 'In my opinion, (Theo ý kiến tôi)' },
    { value: 'I think', label: 'I think (Tôi nghĩ rằng)' },
    { value: 'I believe', label: 'I believe (Tôi tin rằng)' },
    { value: 'From my point of view,', label: 'From my point of view, (Từ góc nhìn tôi)' },
    { value: 'As far as I am concerned,', label: 'As far as I am concerned, (Theo tôi)' },
  ];

  const disagreeOpinionStarters = [
    { value: 'I disagree, in my opinion,', label: 'I disagree, in my opinion, (Tôi không đồng ý, theo tôi)' },
    { value: 'On the contrary, I believe', label: 'On the contrary, I believe (Ngược lại, tôi tin rằng)' },
    { value: "I don't think", label: "I don't think (Tôi không nghĩ rằng)" },
    { value: 'From an opposing point of view,', label: 'From an opposing point of view, (Từ góc nhìn phản đối)' },
    { value: 'However, as far as I am concerned,', label: 'However, as far as I am concerned, (Tuy nhiên, theo tôi)' },
  ];

  const agreeReasonStarters = [
    { value: 'because', label: 'because (Bởi vì)' },
    { value: 'The reason is that', label: 'The reason is that (Lý do là)' },
    { value: 'One reason is that', label: 'One reason is that (Một lý do là)' },
    { value: 'Another reason is that', label: 'Another reason is that (Một lý do khác là)' },
    { value: 'This is because', label: 'This is because (Điều này bởi vì)' },
  ];

  const disagreeReasonStarters = [
    { value: 'because in reality', label: 'because in reality (bởi vì trên thực tế)' },
    { value: 'The main objection is that', label: 'The main objection is that (Lý do phản đối chính là)' },
    { value: 'On the other hand, the reason is that', label: 'On the other hand, the reason is that (Mặt khác, lý do là)' },
    { value: 'Conversely, this is because', label: 'Conversely, this is because (Trái lại, điều này bởi vì)' },
    { value: 'However, the reason is that', label: 'However, the reason is that (Tuy nhiên, lý do là)' },
  ];

  const agreeExampleStarters = [
    { value: 'For example,', label: 'For example, (Ví dụ,...)' },
    { value: 'For instance,', label: 'For instance, (Chẳng hạn như,...)' },
    { value: 'Let me give an example.', label: 'Let me give an example. (Một ví dụ là)' },
    { value: 'A good example is', label: 'A good example is (Ví dụ điển hình là)' },
    { value: 'Such as', label: 'Such as (Chẳng hạn như)' },
  ];

  const disagreeExampleStarters = [
    { value: 'For example, many people argue that', label: 'For example, many people argue that (Ví dụ, nhiều người chỉ ra rằng)' },
    { value: 'To illustrate the counterpoint,', label: 'To illustrate the counterpoint, (Để minh họa quan điểm ngược lại,)' },
    { value: 'For instance, studies show that', label: 'For instance, studies show that (Chẳng hạn như các nghiên cứu cho thấy)' },
    { value: 'A clear counter-example is', label: 'A clear counter-example is (Một phản ví dụ rõ ràng là)' },
    { value: 'Such as in cases where', label: 'Such as in cases where (Chẳng hạn trong trường hợp)' },
  ];

  const handleStanceChange = (newStance: 'agree' | 'disagree') => {
    setDebateStance(newStance);
    if (newStance === 'disagree') {
      setOpinionStarter('I disagree, in my opinion,');
      setReasonStarter('because in reality');
      setExampleStarter('For example, many people argue that');
    } else {
      setOpinionStarter('In my opinion,');
      setReasonStarter('because');
      setExampleStarter('For example,');
    }
  };

  // AI Debate Question & Level Suggestions States
  const [debateQuestionInput, setDebateQuestionInput] = useState('');
  const [debateQuestionLevel, setDebateQuestionLevel] = useState<'' | 'A1-A2' | 'B1-B2' | 'C1-C2' | 'all'>('');
  const [debateLevelError, setDebateLevelError] = useState(false);
  const [writingTargetLevel, setWritingTargetLevel] = useState<'A1-A2' | 'B1-B2' | 'C1-C2'>('B1-B2');
  const [debateSuggestions, setDebateSuggestions] = useState<DebateSuggestionResponse | null>(null);
  const [debateSuggestLoading, setDebateSuggestLoading] = useState(false);

  const sampleTexts = [
    {
      label: 'Email xin nghỉ phép',
      text: "Dear Boss, I want to inform you that I can not go to work tomorrow because I am feel sick and have headache. I will try complete my job when I am back. Thank you very much.",
    },
    {
      label: 'Viết nhật ký',
      text: "Today weather is very hot and I go to coffee shop with my close friend. We talk many story and drink delicious tea. I feel very happy about today.",
    },
    {
      label: 'Luyện thi IELTS',
      text: "In my opinion, internet has both advantage and disadvantage for young people. Many student spend too much time play online game instead of study school lessons.",
    },
  ];

  const debateSampleTopics = [
    {
      title: '🐕 [Đồng ý] Chó tốt hơn mèo',
      topic: 'Chó tốt hơn mèo làm thú cưng (Dogs are better pets than cats)',
      stance: 'agree' as const,
      opinionStarter: 'In my opinion,',
      opinion: 'dogs are better pets than cats',
      reasonStarter: 'because',
      reason: 'they are very loyal, friendly and can protect their owners.',
      exampleStarter: 'For example,',
      example: 'my dog waits for me at the door every afternoon and greets me happily.',
    },
    {
      title: '🐈 [Phản đối / Trái chiều] Mèo tốt hơn chó!',
      topic: 'Chó tốt hơn mèo làm thú cưng (Dogs are better pets than cats)',
      stance: 'disagree' as const,
      opinionStarter: 'I disagree, in my opinion,',
      opinion: 'cats are actually much better pets than dogs',
      reasonStarter: 'because in reality',
      reason: 'cats are independent, clean, quiet and require less attention.',
      exampleStarter: 'For example, many people argue that',
      example: 'cats do not need daily walks and stay peacefully at home while owners are away.',
    },
    {
      title: '📱 [Phản đối / Trái chiều] KHÔNG cấm smartphone ở trường',
      topic: 'Nên cấm học sinh dùng điện thoại ở trường (Smartphones should be banned in school)',
      stance: 'disagree' as const,
      opinionStarter: 'On the contrary, I believe',
      opinion: 'schools should not ban smartphones completely',
      reasonStarter: 'The main objection is that',
      reason: 'smartphones allow students to look up dictionary terms and educational apps instantly.',
      exampleStarter: 'For instance, studies show that',
      example: 'students use smartphones to record teacher lectures and practice English listening in class.',
    },
    {
      title: '📚 [Đồng ý] Bài tập về nhà là cần thiết',
      topic: 'Bài tập về nhà rất bổ ích (Homework is necessary for students)',
      stance: 'agree' as const,
      opinionStarter: 'I believe',
      opinion: 'homework is very important for primary students',
      reasonStarter: 'The reason is that',
      reason: 'it helps children review their daily lessons and builds self-discipline.',
      exampleStarter: 'For instance,',
      example: 'when students practise math problems at home, they understand the formulas much better.',
    },
    {
      title: '📚 [Phản đối / Trái chiều] NÊN GIẢM BỚT bài tập về nhà',
      topic: 'Bài tập về nhà rất bổ ích (Homework is necessary for students)',
      stance: 'disagree' as const,
      opinionStarter: "I don't think",
      opinion: 'students should be given too much homework every day',
      reasonStarter: 'On the other hand, the reason is that',
      reason: 'excessive homework causes stress and reduces time for outdoor physical exercises.',
      exampleStarter: 'To illustrate the counterpoint,',
      example: 'students in Finland have very little homework yet score among the highest in global education.',
    },
    {
      title: '🤖 [Đồng ý] AI hỗ trợ học tiếng Anh',
      topic: 'AI giúp học tiếng Anh hiệu quả (AI tools improve English learning)',
      stance: 'agree' as const,
      opinionStarter: 'From my point of view,',
      opinion: 'AI tools are extremely useful for English learners',
      reasonStarter: 'This is because',
      reason: 'AI provides instant grammar correction and natural speaking practice anytime.',
      exampleStarter: 'A good example is',
      example: 'using ChatGPT or AI apps to check pronunciation and practice daily conversations.',
    },
  ];

  const handleCorrect = async (customTextOverride?: string, customModeOverride?: string) => {
    const textToSubmit = customTextOverride || inputText;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    try {
      const res = await correctWriting(
        textToSubmit,
        customModeOverride || (activeTabMode === 'debate' ? `Debate 3 Bước (${debateStance === 'disagree' ? 'Phản đối / Trái chiều' : 'Đồng ý / Tán thành'})` : mode),
        tone,
        writingTargetLevel
      );
      setAnalysis(res);
      updateDailyGoalProgress('writing', 1);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi sửa bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildAndSubmitDebate = () => {
    if (!opinionText.trim() || !reasonText.trim() || !exampleText.trim()) {
      alert('Vui lòng điền đủ 3 bước: Quan điểm, Lý do và Ví dụ minh họa!');
      return;
    }

    // Smoothly assemble the 3 parts into a cohesive debate paragraph
    const op = opinionStarter.endsWith(',') || opinionStarter.endsWith('.') ? `${opinionStarter} ${opinionText.trim()}` : `${opinionStarter} ${opinionText.trim()}`;
    const re = reasonStarter.toLowerCase().startsWith('because') ? `, ${reasonStarter} ${reasonText.trim()}` : `. ${reasonStarter} ${reasonText.trim()}`;
    const ex = exampleStarter.endsWith('.') ? ` ${exampleStarter} ${exampleText.trim()}` : `. ${exampleStarter} ${exampleText.trim()}`;

    const assembled = `${op}${re}${ex.endsWith('.') ? '' : '.'}`;
    setInputText(assembled);

    const modeTag = `Debate 3 Bước (${debateStance === 'disagree' ? 'Quan điểm Phản đối / Trái chiều' : 'Quan điểm Đồng ý / Tán thành'} - Chủ đề: ${debateTopicInput || 'Tự do'})`;
    handleCorrect(assembled, modeTag);
  };

  const loadDebatePreset = (preset: typeof debateSampleTopics[0]) => {
    setDebateTopicInput(preset.topic);
    setDebateStance(preset.stance);
    setOpinionStarter(preset.opinionStarter);
    setOpinionText(preset.opinion);
    setReasonStarter(preset.reasonStarter);
    setReasonText(preset.reason);
    setExampleStarter(preset.exampleStarter);
    setExampleText(preset.example);
  };

  const handleGenerateDebateSuggestions = async (customQuestion?: string) => {
    const q = customQuestion || debateQuestionInput;
    if (!q.trim()) {
      alert('Vui lòng nhập câu hỏi tranh luận!');
      return;
    }

    if (!debateQuestionLevel) {
      setDebateLevelError(true);
      const selectEl = document.getElementById('debate-level-select');
      if (selectEl) {
        selectEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectEl.focus();
      }
      return;
    }

    setDebateLevelError(false);
    setDebateSuggestLoading(true);
    try {
      const res = await suggestDebateAnswers(q.trim(), debateQuestionLevel);
      setDebateSuggestions(res);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gợi ý câu trả lời tranh luận');
    } finally {
      setDebateSuggestLoading(false);
    }
  };

  const renderInlineGrammarCorrection = (originalText: string, mistakes: WritingAnalysis['mistakes']) => {
    if (!originalText || !mistakes || mistakes.length === 0) {
      return <span>{originalText}</span>;
    }

    const matches: { start: number; end: number; original: string; correction: string }[] = [];
    const lowerText = originalText.toLowerCase();

    for (const m of mistakes) {
      if (!m.original) continue;
      const idx = lowerText.indexOf(m.original.toLowerCase());
      if (idx !== -1) {
        const overlap = matches.some(
          (ex) => (idx >= ex.start && idx < ex.end) || (idx + m.original.length > ex.start && idx + m.original.length <= ex.end)
        );
        if (!overlap) {
          matches.push({
            start: idx,
            end: idx + m.original.length,
            original: originalText.substring(idx, idx + m.original.length),
            correction: m.correction,
          });
        }
      }
    }

    matches.sort((a, b) => a.start - b.start);

    if (matches.length === 0) {
      return <span>{originalText}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.start > lastIndex) {
        parts.push(originalText.substring(lastIndex, match.start));
      }
      parts.push(
        <span key={`m-${i}`} className="inline-flex items-center flex-wrap gap-1 mx-1 my-0.5 align-middle">
          <span className="line-through bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-300">
            {match.original}
          </span>
          <span className="bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5">
            <span className="text-xs">➔</span> {match.correction}
          </span>
        </span>
      );
      lastIndex = match.end;
    });

    if (lastIndex < originalText.length) {
      parts.push(originalText.substring(lastIndex));
    }

    return <>{parts}</>;
  };

  const applySuggestionToForm = (item: DebateSuggestionItem) => {
    setOpinionStarter(item.opinionStarter || 'In my opinion,');
    setOpinionText(item.opinion || '');
    setReasonStarter(item.reasonStarter || 'because');
    setReasonText(item.reason || '');
    setExampleStarter(item.exampleStarter || 'For example,');
    setExampleText(item.example || '');

    const element = document.getElementById('debate-builder-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-12">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 border-3 border-[#EAE4D4] shadow-sm mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#FFEFEA] text-[#FF8C7A] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-2">
          <PenTool className="w-4 h-4" /> AI Native Writer Assistant
        </div>
        <h2 className="font-['Baloo_2'] text-2xl sm:text-3xl font-extrabold text-[#2B3350]">
          Luyện Viết &amp; Sửa Lỗi Ngữ Pháp Theo Văn Phong Bản Xứ
        </h2>
        <p className="text-sm text-[#6B7290] font-semibold mt-1 max-w-xl mx-auto">
          Phát hiện mọi lỗi sai ngữ pháp, nâng cấp bài viết tự nhiên bản xứ &amp; luyện tập lập luận Tranh luận (Debate) 3 bước chuẩn quốc tế!
        </p>

        {/* Mode Selector Switcher */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 bg-[#FFFBF0] p-1.5 rounded-2xl border-2 border-[#EAE4D4] max-w-md mx-auto">
          <button
            onClick={() => setActiveTabMode('standard')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-['Baloo_2'] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTabMode === 'standard'
                ? 'bg-[#FF8C7A] text-white shadow-md'
                : 'text-[#6B7290] hover:text-[#2B3350]'
            }`}
          >
            <PenTool className="w-4 h-4" /> Sửa Bài Viết Tự Do
          </button>
          <button
            onClick={() => setActiveTabMode('debate')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-['Baloo_2'] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTabMode === 'debate'
                ? 'bg-[#1AA6D9] text-white shadow-md'
                : 'text-[#6B7290] hover:text-[#2B3350]'
            }`}
          >
            <MessageSquareCode className="w-4 h-4" /> Luyện Viết Debate 3 Bước
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DEBATE 3-STEP MODE SECTION                                */}
      {/* ========================================================= */}
      {activeTabMode === 'debate' && (
        <div className="space-y-6 mb-8">
          {/* AI DEBATE QUESTION & LEVEL-BASED ANSWER GENERATOR */}
          <div className="bg-gradient-to-r from-[#FFF9F2] via-white to-[#F0FAFF] rounded-3xl p-6 border-3 border-[#FF8C7A] shadow-[0_6px_0_0_#FF8C7A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE4D4] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FF8C7A] text-white flex items-center justify-center font-black shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Baloo_2'] text-xl font-black text-[#2B3350]">
                    AI Gợi Ý Trả Lời Tranh Luận Theo Trình Độ
                  </h3>
                  <p className="text-xs text-[#6B7290] font-semibold">
                    Nhập câu hỏi tranh luận ➔ AI tự động lập luận 3 bước chuẩn trình độ A1-A2, B1-B2, C1-C2!
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-black uppercase tracking-wider text-[#FF8C7A] bg-[#FFEFEA] px-3 py-1 rounded-full border border-[#FF8C7A]/30">
                Ms Lý AI Debate Helper
              </span>
            </div>

            {/* Question Input Field & Level Selector */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="block text-xs font-extrabold text-[#2B3350] uppercase tracking-wider">
                  ❓ Nhập câu hỏi / chủ đề tranh luận của bạn:
                </label>
                <span className="text-[11px] font-bold text-[#FF8C7A]">
                  *(Lưu ý: Bắt buộc chọn trình độ trước khi bấm AI gợi ý)
                </span>
              </div>

              {debateLevelError && (
                <div className="bg-red-50 border-2 border-red-300 p-3 rounded-2xl text-red-700 font-extrabold text-xs flex items-center gap-2 animate-bounce">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>⚠️ Vui lòng chọn trình độ (Cơ bản, Trung cấp, Nâng cao hoặc Tất cả) trước khi bấm "AI Gợi Ý Trả Lời"!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={debateQuestionInput}
                  onChange={(e) => setDebateQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateDebateSuggestions()}
                  placeholder="Ví dụ: Should students wear school uniforms? / Có nên cấm điện thoại trong lớp?..."
                  className="flex-1 p-3.5 rounded-2xl border-2 border-[#EAE4D4] focus:border-[#FF8C7A] bg-white font-semibold text-sm text-[#2B3350] outline-none shadow-inner"
                />
                <select
                  id="debate-level-select"
                  value={debateQuestionLevel}
                  onChange={(e) => {
                    setDebateQuestionLevel(e.target.value as any);
                    if (e.target.value) setDebateLevelError(false);
                  }}
                  className={`p-3.5 rounded-2xl border-2 font-extrabold text-xs outline-none cursor-pointer transition-all ${
                    debateLevelError
                      ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-400'
                      : 'border-[#EAE4D4] focus:border-[#FF8C7A] bg-white text-[#2B3350]'
                  }`}
                >
                  <option value="">⚠️ Bắt buộc: Chọn trình độ (A1 - C2)</option>
                  <option value="A1-A2">🟢 Cơ bản (A1 - A2)</option>
                  <option value="B1-B2">🟡 Trung cấp (B1 - B2)</option>
                  <option value="C1-C2">🔴 Nâng cao (C1 - C2 / IELTS)</option>
                  <option value="all">🌟 Tất cả trình độ (A1-C2)</option>
                </select>
                <button
                  onClick={() => handleGenerateDebateSuggestions()}
                  disabled={debateSuggestLoading}
                  className="py-3.5 px-6 rounded-2xl bg-[#FF8C7A] hover:bg-[#ff7661] text-white font-['Baloo_2'] font-extrabold text-sm shadow-[0_4px_0_0_#e56e5d] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {debateSuggestLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> AI Gợi Ý Trả Lời
                    </>
                  )}
                </button>
              </div>

              {/* Quick Sample Topics Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                <span className="text-[11px] font-bold text-[#6B7290] whitespace-nowrap">🔥 Thử câu hỏi mẫu:</span>
                {[
                  { label: '👕 Mặc đồng phục', q: 'Should students wear school uniforms?' },
                  { label: '📱 Dùng smartphone ở trường', q: 'Should smartphones be allowed in schools?' },
                  { label: '📚 Bài tập về nhà', q: 'Is homework necessary for elementary students?' },
                  { label: '🤖 AI & Giáo dục', q: 'Will AI replace teachers in the future?' },
                  { label: '🐶 Chó vs Mèo làm thú cưng', q: 'Are dogs better pets than cats?' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDebateQuestionInput(chip.q);
                      handleGenerateDebateSuggestions(chip.q);
                    }}
                    className="text-xs font-bold text-[#2B3350] bg-white hover:bg-[#FFEFEA] hover:text-[#FF8C7A] hover:border-[#FF8C7A] border border-[#EAE4D4] px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display AI Debate Suggestions Results */}
            {debateSuggestions && (
              <div className="space-y-4 pt-3 border-t border-[#EAE4D4]">
                <div className="flex items-center justify-between">
                  <h4 className="font-['Baloo_2'] text-base font-extrabold text-[#2B3350] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#FF8C7A]" />
                    Gợi ý trả lời cho câu hỏi: <span className="text-[#FF8C7A]">"{debateSuggestions.question}"</span>
                  </h4>
                  <span className="text-xs font-bold text-[#6B7290] bg-white px-3 py-1 rounded-full border border-[#EAE4D4]">
                    {debateSuggestions.suggestions.length} gợi ý
                  </span>
                </div>

                <div
                  className={`grid grid-cols-1 ${
                    debateSuggestions.suggestions.length === 1
                      ? 'max-w-2xl mx-auto w-full'
                      : debateSuggestions.suggestions.length === 2
                      ? 'md:grid-cols-2'
                      : 'md:grid-cols-3'
                  } gap-4`}
                >
                  {debateSuggestions.suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className={`bg-white rounded-2xl p-4 border-2 shadow-sm flex flex-col justify-between space-y-3 transition-all hover:shadow-md ${
                        item.levelCode === 'A1-A2'
                          ? 'border-emerald-200 hover:border-emerald-400'
                          : item.levelCode === 'B1-B2'
                          ? 'border-amber-200 hover:border-amber-400'
                          : 'border-purple-200 hover:border-purple-400'
                      }`}
                    >
                      <div>
                        {/* Level & Side Header Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${
                              item.levelCode === 'A1-A2'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : item.levelCode === 'B1-B2'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-purple-100 text-purple-800 border border-purple-300'
                            }`}
                          >
                            {item.level}
                          </span>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                            {item.side}
                          </span>
                        </div>

                        {/* 3 Steps Visual Breakdown */}
                        <div className="space-y-2 text-xs font-medium text-[#2B3350] bg-[#FFFBF0] p-3 rounded-xl border border-[#EAE4D4]">
                          <div>
                            <span className="font-extrabold text-[#1AA6D9]">1. Opinion: </span>
                            <span className="font-bold underline text-[#1AA6D9]">{item.opinionStarter}</span>{' '}
                            <span>{item.opinion}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-[#22C55E]">2. Reason: </span>
                            <span className="font-bold underline text-[#22C55E]">{item.reasonStarter}</span>{' '}
                            <span>{item.reason}</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-[#D97706]">3. Example: </span>
                            <span className="font-bold underline text-[#D97706]">{item.exampleStarter}</span>{' '}
                            <span>{item.example}</span>
                          </div>
                        </div>

                        {/* Full Answer & Translation */}
                        <div className="mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200 relative group">
                          <p className="text-xs font-bold text-[#2B3350] leading-relaxed pr-6">
                            "{item.fullAnswer}"
                          </p>
                          <p className="text-[11px] text-gray-500 italic mt-1.5 border-t border-gray-200 pt-1">
                            🇻🇳 {item.vietnameseTranslation}
                          </p>
                          <button
                            onClick={() => speakText(item.fullAnswer)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white text-[#1AA6D9] hover:bg-[#1AA6D9] hover:text-white border border-gray-200 transition-all cursor-pointer"
                            title="Nghe phát âm tiếng Anh"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Use Answer Button */}
                      <button
                        onClick={() => applySuggestionToForm(item)}
                        className="w-full py-2 px-3 rounded-xl bg-[#1AA6D9] hover:bg-[#158db9] text-white font-['Baloo_2'] font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Áp dụng vào Khung 3 Bước
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preset Sample Debate Topics */}
          <div className="bg-white rounded-3xl p-5 border-3 border-[#EAE4D4] shadow-sm">
            <span className="text-xs font-extrabold text-[#6B7290] uppercase tracking-wider block mb-2">
              💡 Chọn chủ đề bài mẫu tranh luận có sẵn:
            </span>
            <div className="flex flex-wrap gap-2">
              {debateSampleTopics.map((pt, i) => (
                <button
                  key={i}
                  onClick={() => loadDebatePreset(pt)}
                  className="bg-[#FFFBF0] hover:bg-[#1AA6D9] hover:text-white text-[#2B3350] text-xs font-extrabold px-3.5 py-2 rounded-xl border-2 border-[#EAE4D4] transition-all cursor-pointer"
                >
                  {pt.title}
                </button>
              ))}
            </div>
          </div>

          {/* Guided 3-Step Debate Builder Form */}
          <div id="debate-builder-form" className={`bg-white rounded-3xl p-6 border-3 shadow-[0_6px_0_0] space-y-5 transition-all ${
            debateStance === 'disagree' ? 'border-[#FF8C7A] shadow-[#FF8C7A]' : 'border-[#1AA6D9] shadow-[#1AA6D9]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EAE4D4] gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${debateStance === 'disagree' ? 'text-[#FF8C7A]' : 'text-[#1AA6D9]'}`} />
                <h3 className="font-['Baloo_2'] text-xl font-bold text-[#2B3350]">
                  Điền Bài Tranh Luận Theo 3 Bước
                </h3>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                debateStance === 'disagree' ? 'bg-[#FFEFEA] text-[#FF8C7A]' : 'bg-[#EAF9FF] text-[#1AA6D9]'
              }`}>
                Khung Luyện Tập Thông Minh
              </span>
            </div>

            {/* Topic & Stance Selector Row */}
            <div className="bg-[#FFFBF0] p-4 rounded-2xl border-2 border-[#EAE4D4] space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2B3350] uppercase tracking-wider mb-1">
                  📌 1. Chủ đề / Đề bài tranh luận:
                </label>
                <input
                  type="text"
                  value={debateTopicInput}
                  onChange={(e) => setDebateTopicInput(e.target.value)}
                  placeholder="Ví dụ: Dogs are better pets than cats / Smartphones should be banned in schools..."
                  className="w-full p-3 rounded-xl border border-[#EAE4D4] focus:border-[#1AA6D9] font-bold text-sm text-[#2B3350] bg-white outline-none"
                />
              </div>

              {/* Stance Selector Buttons */}
              <div>
                <label className="block text-xs font-extrabold text-[#2B3350] uppercase tracking-wider mb-1.5">
                  ⚖️ 2. Lựa chọn Lập trường của em (Stance):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStanceChange('agree')}
                    className={`p-3 rounded-2xl font-['Baloo_2'] font-extrabold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      debateStance === 'agree'
                        ? 'bg-[#1AA6D9] text-white border-[#1AA6D9] shadow-md scale-[1.01]'
                        : 'bg-white text-[#2B3350] border-[#EAE4D4] hover:bg-blue-50'
                    }`}
                  >
                    <span>🟢 Quan Điểm Đồng Ý / Tán Thành (Pro)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStanceChange('disagree')}
                    className={`p-3 rounded-2xl font-['Baloo_2'] font-extrabold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      debateStance === 'disagree'
                        ? 'bg-[#FF8C7A] text-white border-[#FF8C7A] shadow-md scale-[1.01]'
                        : 'bg-white text-[#2B3350] border-[#EAE4D4] hover:bg-orange-50'
                    }`}
                  >
                    <span>🔴 Quan Điểm Phản Đối / Trái Chiều (Con)</span>
                  </button>
                </div>

                {debateStance === 'disagree' && (
                  <div className="mt-2 text-xs font-semibold text-[#E2604C] bg-[#FFEFEA] p-2.5 rounded-xl border border-[#FF8C7A]/40 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>
                      Em chọn <strong>Phản đối / Quan điểm trái chiều</strong>. Các mẫu câu 3 bước phía dưới đã được tự động cập nhật cấu trúc phản biện thuyết phục!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 1: Opinion Input */}
            <div className={`p-4 rounded-2xl border-2 space-y-2 ${
              debateStance === 'disagree' ? 'bg-[#FFF5F2] border-[#FFC4BA]' : 'bg-[#F0F9FF] border-[#BEE9FF]'
            }`}>
              <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                debateStance === 'disagree' ? 'text-[#E2604C]' : 'text-[#1AA6D9]'
              }`}>
                Bước 1: Đưa ra quan điểm (Giving an Opinion)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={opinionStarter}
                  onChange={(e) => setOpinionStarter(e.target.value)}
                  className={`p-3 rounded-xl border font-bold text-xs text-[#2B3350] bg-white outline-none ${
                    debateStance === 'disagree' ? 'border-[#FF8C7A]' : 'border-[#1AA6D9]'
                  }`}
                >
                  {(debateStance === 'disagree' ? disagreeOpinionStarters : agreeOpinionStarters).map((s, i) => (
                    <option key={i} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={opinionText}
                  onChange={(e) => setOpinionText(e.target.value)}
                  placeholder={
                    debateStance === 'disagree'
                      ? 'Ví dụ: cats are actually much better pets than dogs...'
                      : 'Ví dụ: dogs are better pets than cats...'
                  }
                  className="sm:col-span-2 p-3 rounded-xl border border-[#EAE4D4] focus:border-[#1AA6D9] font-semibold text-sm text-[#2B3350] bg-white outline-none"
                />
              </div>
            </div>

            {/* Step 2: Reason Input */}
            <div className="bg-[#F0FDF4] p-4 rounded-2xl border-2 border-[#BBF7D0] space-y-2">
              <label className="block text-xs font-extrabold text-[#22C55E] uppercase tracking-wider">
                Bước 2: Nêu lý do (Giving Reasons)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={reasonStarter}
                  onChange={(e) => setReasonStarter(e.target.value)}
                  className="p-3 rounded-xl border border-[#22C55E] font-bold text-xs text-[#2B3350] bg-white outline-none"
                >
                  {(debateStance === 'disagree' ? disagreeReasonStarters : agreeReasonStarters).map((s, i) => (
                    <option key={i} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder={
                    debateStance === 'disagree'
                      ? 'Ví dụ: cats are independent, quiet and take less space...'
                      : 'Ví dụ: they are very loyal, friendly and protect owners...'
                  }
                  className="sm:col-span-2 p-3 rounded-xl border border-[#BBF7D0] focus:border-[#22C55E] font-semibold text-sm text-[#2B3350] bg-white outline-none"
                />
              </div>
            </div>

            {/* Step 3: Example Input */}
            <div className="bg-[#FFFBEB] p-4 rounded-2xl border-2 border-[#FEF08A] space-y-2">
              <label className="block text-xs font-extrabold text-[#D97706] uppercase tracking-wider">
                Bước 3: Đưa ví dụ minh họa (Giving Examples)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={exampleStarter}
                  onChange={(e) => setExampleStarter(e.target.value)}
                  className="p-3 rounded-xl border border-[#D97706] font-bold text-xs text-[#2B3350] bg-white outline-none"
                >
                  {(debateStance === 'disagree' ? disagreeExampleStarters : agreeExampleStarters).map((s, i) => (
                    <option key={i} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={exampleText}
                  onChange={(e) => setExampleText(e.target.value)}
                  placeholder={
                    debateStance === 'disagree'
                      ? 'Ví dụ: cats stay peacefully at home without needing daily outdoor walks...'
                      : 'Ví dụ: my dog waits for me at the door every afternoon...'
                  }
                  className="sm:col-span-2 p-3 rounded-xl border border-[#FEF08A] focus:border-[#D97706] font-semibold text-sm text-[#2B3350] bg-white outline-none"
                />
              </div>
            </div>

            {/* Assembly Preview & Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-semibold text-[#6B7290]">
                💡 Ghép 3 câu thành 1 đoạn văn ➔ AI chấm điểm & gợi ý bài trả lời chuẩn Khung Tham Chiếu Châu Âu (A1 - C2)!
              </div>

              <button
                onClick={handleBuildAndSubmitDebate}
                disabled={loading}
                className={`w-full sm:w-auto text-white font-['Baloo_2'] font-extrabold px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-md active:translate-y-0.5 ${
                  debateStance === 'disagree' ? 'bg-[#FF8C7A] hover:bg-[#e2604c]' : 'bg-[#1AA6D9] hover:bg-[#0082b3]'
                }`}
              >
                <Sparkles className="w-5 h-5 text-[#FFCF44]" />
                <span>{loading ? 'AI Đang Đánh Giá Debate...' : 'Gửi AI Chấm Điểm & Đánh Giá 3 Bước'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STANDARD / GENERAL WRITING INPUT                          */}
      {/* ========================================================= */}
      {activeTabMode === 'standard' && (
        <div className="bg-white rounded-3xl p-6 border-3 border-[#EAE4D4] shadow-[0_6px_0_0_#EAE4D4] mb-8">
          {/* Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Topic Mode */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6B7290] mb-1.5">
                Chủ đề luyện viết
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-3 rounded-2xl border-2 border-[#EAE4D4] font-bold text-sm text-[#2B3350] bg-[#FFFBF0] outline-none"
              >
                <option value="Tự do">Viết tự do / Daily Journal</option>
                <option value="Email công việc">Thư điện tử / Work Email</option>
                <option value="Luyện thi IELTS/TOEFL">Bài luận IELTS / Academic Essay</option>
                <option value="Kể chuyện">Kể chuyện / Storytelling</option>
              </select>
            </div>

            {/* Target Tone */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#6B7290] mb-1.5">
                Văn phong mong muốn
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-3 rounded-2xl border-2 border-[#EAE4D4] font-bold text-sm text-[#2B3350] bg-[#FFFBF0] outline-none"
              >
                <option value="Tự nhiên bản xứ">Tự nhiên người bản xứ (Native Conversational)</option>
                <option value="Academic / Trang trọng">Academic / Trang trọng (Formal)</option>
                <option value="Công sở / Business">Công sở / Business (Professional)</option>
                <option value="Thân mật / Friendly">Thân mật / Friendly</option>
              </select>
            </div>

            {/* Target Level */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#2B3350] mb-1.5 flex items-center gap-1">
                🎯 Trình độ nâng cấp
              </label>
              <select
                value={writingTargetLevel}
                onChange={(e) => setWritingTargetLevel(e.target.value as any)}
                className="w-full p-3 rounded-2xl border-2 border-[#EAE4D4] focus:border-[#FF8C7A] font-extrabold text-sm text-[#2B3350] bg-[#FFFBF0] outline-none cursor-pointer"
              >
                <option value="A1-A2">🟢 Cơ bản (A1 - A2)</option>
                <option value="B1-B2">🟡 Trung cấp (B1 - B2)</option>
                <option value="C1-C2">🔴 Nâng cao (C1 - C2 / IELTS)</option>
              </select>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative mb-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={5}
              placeholder="Nhập hoặc dán nội dung tiếng Anh cần sửa tại đây..."
              className="w-full p-4 rounded-2xl border-2 border-[#EAE4D4] focus:border-[#FF8C7A] outline-none font-semibold text-base text-[#2B3350] resize-y bg-[#FFFBF0]"
            />
            <div className="absolute right-4 bottom-4 text-xs font-bold text-[#6B7290]">
              {inputText.trim().split(/\s+/).filter(Boolean).length} từ
            </div>
          </div>

          {/* Sample Prompts & Submit Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#6B7290]">Thử bài mẫu:</span>
              {sampleTexts.map((st, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(st.text)}
                  className="bg-gray-100 hover:bg-[#FFEFEA] hover:text-[#FF8C7A] text-[#6B7290] text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 transition-all cursor-pointer"
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCorrect()}
              disabled={loading || !inputText.trim()}
              className="bg-[#FF8C7A] hover:bg-[#E2604C] active:translate-y-0.5 text-white font-['Baloo_2'] font-bold px-7 py-3.5 rounded-full shadow-[0_4px_0_0_#E2604C] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{loading ? 'AI Đang Phân Tích & Sửa Lỗi...' : 'Sửa Lỗi & Nâng Cấp Bài Viết'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-3xl p-10 text-center border-3 border-[#EAE4D4] shadow-sm my-6">
          <div className="w-12 h-12 border-4 border-[#EAE4D4] border-t-[#FF8C7A] rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold text-[#2B3350] text-lg">AI đang rà soát từng từ, đánh giá cấu trúc &amp; nâng cấp bài viết...</p>
          <p className="text-xs text-[#6B7290] font-semibold mt-1">
            Đang phân tích ngữ pháp, lập luận tranh luận và văn phong chuẩn bản xứ Mỹ/Anh.
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* ANALYSIS RESULTS                                          */}
      {/* ========================================================= */}
      {analysis && !loading && (
        <div className="space-y-6">
          {/* Score Overview Card - 10 Point Scale */}
          <div className="bg-gradient-to-br from-white via-[#FFFDF5] to-[#FFFBF0] rounded-3xl p-6 sm:p-8 border-3 border-[#FFCF44] shadow-[0_6px_0_0_#FFCF44]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#EAE4D4]">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#E2A200] bg-[#FFFBF0] px-3 py-1 rounded-full border border-[#E2A200]/30 inline-block mb-2">
                  🏆 Đánh Giá Bài Viết (Thang Điểm 10)
                </span>
                <h3 className="font-['Baloo_2'] text-2xl font-black text-[#2B3350]">
                  {analysis.overallScore >= 85
                    ? '🌟 Bài viết xuất sắc & rất tự nhiên!'
                    : analysis.overallScore >= 70
                    ? '👍 Bài viết khá tốt, cần trau chuốt thêm ít lỗi'
                    : '💪 Bài viết cần cải thiện ngữ pháp & từ vựng'}
                </h3>
                <div className="mt-3 bg-white p-4 rounded-2xl border border-[#EAE4D4] shadow-2xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF8C7A] text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    MsL
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#FF8C7A] uppercase tracking-wider block mb-0.5">
                      Đánh giá chung từ Cô Lý AI:
                    </span>
                    <p className="text-sm font-bold text-[#2B3350] leading-relaxed">{analysis.summaryFeedbackVi}</p>
                  </div>
                </div>
              </div>

              {/* 10 Point Scale Badge */}
              <div className="flex flex-col items-center justify-center bg-[#FFCF44] text-[#2B3350] px-7 py-5 rounded-3xl border-3 border-[#E2A200] shadow-sm shrink-0">
                <span className="text-xs font-extrabold uppercase tracking-wider">Điểm Tổng</span>
                <span className="font-['Baloo_2'] text-5xl font-black">
                  {(analysis.overallScore / 10).toFixed(1)}
                </span>
                <span className="text-xs font-bold text-[#6B5000]">Thang điểm 10</span>
              </div>
            </div>

            {/* Sub-scores out of 10 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="bg-white p-3.5 rounded-2xl border border-[#EAE4D4] text-center shadow-2xs">
                <span className="text-xs font-bold text-[#6B7290] block mb-1">Ngữ Pháp</span>
                <span className="font-extrabold text-xl text-[#1AA6D9]">
                  {(analysis.grammarScore / 10).toFixed(1)} <span className="text-xs font-normal text-gray-400">/10</span>
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-[#EAE4D4] text-center shadow-2xs">
                <span className="text-xs font-bold text-[#6B7290] block mb-1">Từ Vựng</span>
                <span className="font-extrabold text-xl text-[#22C55E]">
                  {(analysis.vocabScore / 10).toFixed(1)} <span className="text-xs font-normal text-gray-400">/10</span>
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-[#EAE4D4] text-center shadow-2xs">
                <span className="text-xs font-bold text-[#6B7290] block mb-1">Độ Tự Nhiên</span>
                <span className="font-extrabold text-xl text-[#FF8C7A]">
                  {(analysis.naturalnessScore / 10).toFixed(1)} <span className="text-xs font-normal text-gray-400">/10</span>
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-[#EAE4D4] text-center shadow-2xs">
                <span className="text-xs font-bold text-[#6B7290] block mb-1">Mạch Lạc</span>
                <span className="font-extrabold text-xl text-[#E2A200]">
                  {(analysis.coherenceScore / 10).toFixed(1)} <span className="text-xs font-normal text-gray-400">/10</span>
                </span>
              </div>
            </div>
          </div>

          {/* 1. BẢN SỬA LỖI NGỮ PHÁP TRỰC TIẾP (Inline Strikethrough Red + Correction Green) */}
          <div className="bg-white rounded-3xl p-6 border-3 border-[#EAE4D4] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE4D4] pb-3">
              <h4 className="font-['Baloo_2'] text-lg font-black text-[#2B3350] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>1. Bản Sửa Lỗi Ngữ Pháp Trực Tiếp (Lỗi sai gạch đỏ &amp; sửa xanh bên cạnh)</span>
              </h4>
              <button
                onClick={() => speakText(analysis.correctedText, 'en-US')}
                className="p-1.5 rounded-full text-[#1AA6D9] hover:bg-blue-50 transition-all cursor-pointer"
                title="Nghe đọc bản đã sửa"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-base font-semibold text-[#2B3350] leading-relaxed bg-[#FFFBF8] p-5 rounded-2xl border-2 border-[#EAE4D4]">
              {renderInlineGrammarCorrection(analysis.originalText, analysis.mistakes)}
            </div>

            {/* Detailed Mistake List */}
            {analysis.mistakes && analysis.mistakes.length > 0 && (
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-extrabold text-[#6B7290] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#FF8C7A]" /> Chi tiết {analysis.mistakes.length} lỗi cần sửa:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.mistakes.map((m, i) => (
                    <div key={i} className="bg-[#FFFBF0] border border-[#EAE4D4] rounded-2xl p-3.5 space-y-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded line-through">
                          {m.original}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6B7290]" />
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded">
                          {m.correction}
                        </span>
                      </div>
                      <p className="font-semibold text-[#2B3350]">
                        💡 {m.explanationVi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. BẢN NÂNG CẤP THEO ĐÚNG TRÌNH ĐỘ ĐÃ CHỌN */}
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#FFEFEA] rounded-3xl p-6 border-3 border-[#FF8C7A] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#FF8C7A]/30 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF8C7A]" />
                <h4 className="font-['Baloo_2'] text-lg font-black text-[#E2604C]">
                  2. Bản Nâng Cấp Theo Đúng Trình Độ: {' '}
                  <span className="bg-[#FF8C7A] text-white px-2.5 py-0.5 rounded-lg text-xs font-black">
                    {writingTargetLevel === 'A1-A2'
                      ? '🟢 Cơ bản (A1-A2)'
                      : writingTargetLevel === 'C1-C2'
                      ? '🔴 Nâng cao (C1-C2 / IELTS)'
                      : '🟡 Trung cấp (B1-B2)'}
                  </span>
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(analysis.nativeVersion, 'en-US')}
                  className="p-1.5 rounded-full text-[#FF8C7A] hover:bg-orange-100 transition-all cursor-pointer"
                  title="Nghe đọc giọng Mỹ bản xứ"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    copyToClipboard(analysis.nativeVersion);
                  }}
                  className="p-1.5 rounded-full text-[#FF8C7A] hover:bg-orange-100 transition-all cursor-pointer"
                  title="Sao chép bản nâng cấp"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-base font-extrabold text-[#2B3350] leading-relaxed bg-white p-5 rounded-2xl border-2 border-[#FF8C7A]/30 shadow-2xs">
              {analysis.nativeVersion}
            </p>
            {copied && <span className="text-xs font-extrabold text-emerald-600 block">✓ Đã sao chép bài nâng cấp!</span>}
          </div>

          {/* Key Native Vocabulary Recommendations */}
          {analysis.keyVocabularyVi && analysis.keyVocabularyVi.length > 0 && (
            <div className="bg-[#EAF9FF] rounded-3xl p-6 border-2 border-[#3EC6F0]">
              <h4 className="font-['Baloo_2'] text-lg font-bold text-[#1AA6D9] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFCF44]" /> Từ Vựng &amp; Collocations Nâng Cấp Nên Dùng (Kèm Nghĩa Tiếng Việt)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {analysis.keyVocabularyVi.map((kv, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-2xl border-2 border-[#BEE9FF] shadow-sm flex flex-col justify-between hover:border-[#3EC6F0] transition-all"
                  >
                    <div>
                      {/* Term header with sound and save buttons */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-['Baloo_2'] font-extrabold text-lg text-[#2B3350]">
                            {kv.term}
                          </span>
                          <button
                            onClick={() => speakText(kv.term, 'en-US')}
                            className="p-1 text-[#1AA6D9] hover:bg-[#EAF9FF] rounded-full transition-all"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            saveWordToStorage({
                              word: kv.term,
                              phonetic: '',
                              vietnamese: kv.meaning,
                              partOfSpeech: 'Collocation / Từ nâng cao',
                              example: kv.usage,
                            });
                            alert(`Đã lưu "${kv.term}" (${kv.meaning}) vào Sổ Từ!`);
                          }}
                          className="bg-[#FFCF44] hover:bg-[#e2a200] text-[#2B3350] font-extrabold text-[11px] px-2.5 py-1 rounded-lg border border-[#E2A200] transition-all cursor-pointer shrink-0"
                        >
                          + Lưu từ
                        </button>
                      </div>

                      {/* Explicit Vietnamese Meaning Tag */}
                      <div className="bg-[#FFFBF0] border border-[#FFCF44] px-3 py-2 rounded-xl mb-2 flex items-center gap-1.5 text-xs font-bold text-[#2B3350]">
                        <span className="text-sm">🇻🇳</span>
                        <span className="text-[#B8860B] font-extrabold shrink-0">Nghĩa Việt:</span>
                        <span className="text-[#2B3350] font-extrabold">{kv.meaning}</span>
                      </div>

                      {/* Usage Context / Example */}
                      <p className="text-xs text-[#6B7290] font-semibold leading-relaxed">
                        <span className="font-extrabold text-[#1AA6D9]">💡 Cách dùng:</span> {kv.usage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
