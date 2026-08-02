import React, { useState, useEffect } from 'react';
import { Bell, Flame, Target, Sparkles, Volume2, CheckCircle2, AlertCircle, Plus, Trash2, Clock } from 'lucide-react';
import { WordOfTheDay, QuizQuestion, ReminderSetting, DailyGoal } from '../types';
import { fetchWordOfTheDay, fetchDailyQuiz } from '../services/apiService';
import { speakText } from '../utils/speechUtils';
import {
  getStreakInfo,
  getDailyGoals,
  updateDailyGoalProgress,
  getReminderSettings,
  saveReminderSettings,
  saveWordToStorage,
} from '../utils/storageUtils';

export const RemindersTab: React.FC = () => {
  const streak = getStreakInfo();
  const [goals, setGoals] = useState<DailyGoal>(getDailyGoals());
  const [reminders, setReminders] = useState<ReminderSetting[]>(getReminderSettings());
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('Nhắc nhở học tập mới');

  // Word of the Day
  const [wotd, setWotd] = useState<WordOfTheDay | null>(null);
  const [loadingWotd, setLoadingWotd] = useState(false);

  // Daily Quiz
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Notification status
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  useEffect(() => {
    loadWotd();
    loadQuiz('all');
  }, []);

  const loadWotd = async () => {
    setLoadingWotd(true);
    try {
      const data = await fetchWordOfTheDay();
      setWotd(data);
    } catch (e) {
      console.warn('WOTD error:', e);
    } finally {
      setLoadingWotd(false);
    }
  };

  const loadQuiz = async (level: string = selectedLevel) => {
    setLoadingQuiz(true);
    setQuizSubmitted(false);
    setUserAnswers({});
    try {
      const data = await fetchDailyQuiz(level);
      setQuizQuestions(data.questions || []);
    } catch (e) {
      console.warn('Quiz error:', e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleLevelChange = (lvl: string) => {
    setSelectedLevel(lvl);
    loadQuiz(lvl);
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new Notification('Fly High Dictionary - Ms Lý AI', {
          body: 'Đã bật hệ thống nhắc nhở học tập thông minh mỗi ngày!',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const toggleReminder = (index: number) => {
    const updated = [...reminders];
    updated[index].enabled = !updated[index].enabled;
    setReminders(updated);
    saveReminderSettings(updated);
  };

  const addReminder = () => {
    if (!newTime) return;
    const updated = [...reminders, { time: newTime, label: newLabel, enabled: true }];
    setReminders(updated);
    saveReminderSettings(updated);
    setNewLabel('Nhắc nhở học tập mới');
  };

  const deleteReminder = (index: number) => {
    const updated = reminders.filter((_, i) => i !== index);
    setReminders(updated);
    saveReminderSettings(updated);
  };

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    updateDailyGoalProgress('words', 2);
    setGoals(getDailyGoals());
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-12 space-y-8">
      {/* Overview Streak & Goals Card */}
      <div className="bg-gradient-to-r from-[#3EC6F0] to-[#1AA6D9] text-white rounded-3xl p-6 sm:p-8 shadow-[0_6px_0_0_#1AA6D9]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
              <Flame className="w-4 h-4 text-[#FFCF44] fill-current" /> Chuỗi Học Tự Hào
            </div>
            <h2 className="font-['Baloo_2'] text-3xl font-extrabold">
              {streak.count} Ngày Liên Tiếp Học Cùng Ms Lý AI!
            </h2>
            <p className="text-sm font-semibold opacity-90 mt-1 max-w-md">
              Duy trì thói quen học tiếng Anh 10 phút mỗi ngày mang lại sự bứt phá thần kỳ về phản xạ bản xứ.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl p-4 text-center shrink-0 min-w-[160px]">
            <span className="text-xs font-bold uppercase tracking-wider block opacity-90">Tiến Độ Hôm Nay</span>
            <span className="font-['Baloo_2'] text-4xl font-extrabold">{goals.learnedWords}</span>
            <span className="text-xs font-bold block">/ {goals.targetWords} từ vựng</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: WORD OF THE DAY */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#FFCF44] shadow-[0_6px_0_0_#FFCF44]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE4D4]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#E2A200]" />
            <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350]">
              Từ Vựng Thông Minh Hôm Nay
            </h3>
          </div>
          <button
            onClick={loadWotd}
            disabled={loadingWotd}
            className="text-xs font-bold text-[#1AA6D9] hover:underline"
          >
            {loadingWotd ? 'Đang đổi từ...' : 'Đổi từ khác 🔄'}
          </button>
        </div>

        {loadingWotd ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-[#EAE4D4] border-t-[#FFCF44] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-[#6B7290]">Đang chọn từ vựng tuyệt vời cho bạn...</p>
          </div>
        ) : wotd ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-['Baloo_2'] text-3xl font-extrabold text-[#2B3350]">{wotd.word}</span>{' '}
                <span className="text-sm font-mono text-[#1AA6D9] font-bold">{wotd.phonetic}</span>{' '}
                <span className="bg-[#6B7290] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {wotd.partOfSpeech}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(wotd.word, 'en-US')}
                  className="bg-[#3EC6F0] text-white p-2 rounded-full hover:bg-[#1AA6D9]"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    saveWordToStorage({
                      word: wotd.word,
                      phonetic: wotd.phonetic,
                      vietnamese: wotd.vietnamese,
                      partOfSpeech: wotd.partOfSpeech,
                      example: wotd.exampleEn,
                    });
                    alert('Đã lưu từ vựng này vào Sổ Từ!');
                  }}
                  className="bg-[#FFCF44] text-[#2B3350] font-bold text-xs px-3.5 py-2 rounded-full border border-[#E2A200]"
                >
                  + Lưu vào Sổ từ
                </button>
              </div>
            </div>

            <div className="bg-[#FFFBF0] border border-[#FFCF44] p-4 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8860B] block mb-0.5">
                Nghĩa Việt:
              </span>
              <p className="font-['Baloo_2'] text-xl font-bold text-[#2B3350]">{wotd.vietnamese}</p>
              <p className="text-sm font-semibold text-[#6B7290] mt-1">{wotd.definitionEn}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-sm font-semibold text-[#2B3350]">
              <p className="font-bold">"{wotd.exampleEn}"</p>
              <p className="text-xs text-[#6B7290] italic mt-0.5">({wotd.exampleVi})</p>
            </div>

            <div className="bg-[#EAF9FF] border border-[#BEE9FF] p-3 rounded-2xl text-xs font-bold text-[#1AA6D9]">
              💡 Mẹo bản xứ: {wotd.usageTipVi}
            </div>
          </div>
        ) : null}
      </div>

      {/* SECTION 2: SMART REMINDERS SCHEDULER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#EAE4D4] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EAE4D4]">
          <div>
            <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350] flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#FF8C7A]" /> Hẹn Giờ Nhắc Nhở Học Tập Thông Minh
            </h3>
            <p className="text-xs text-[#6B7290] font-semibold mt-0.5">
              Tự động phát thông báo nhắc nhở để bạn không bỏ lỡ chuỗi ngày học tiếng Anh.
            </p>
          </div>

          <button
            onClick={requestNotificationPermission}
            className={`px-4 py-2 rounded-full font-bold text-xs border transition-all cursor-pointer ${
              notifPermission === 'granted'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-[#FF8C7A] text-white border-[#E2604C]'
            }`}
          >
            {notifPermission === 'granted' ? '✓ Đã Bật Thông Báo Trình Duyệt' : '🔔 Cho Phép Bật Thông Báo'}
          </button>
        </div>

        {/* Reminders List */}
        <div className="space-y-3 mb-6">
          {reminders.map((rem, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                rem.enabled ? 'bg-[#FFFBF0] border-[#FFCF44]' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#E2A200]" />
                <div>
                  <span className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350]">{rem.time}</span>
                  <span className="text-xs font-bold text-[#6B7290] block">{rem.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleReminder(idx)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                    rem.enabled ? 'bg-[#7ED957]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      rem.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>

                <button onClick={() => deleteReminder(idx)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Reminder */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#EAE4D4]">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="p-2.5 rounded-2xl border-2 border-[#EAE4D4] font-bold text-sm bg-white"
          />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Tên nhắc nhở..."
            className="flex-1 min-w-[200px] p-2.5 rounded-2xl border-2 border-[#EAE4D4] font-semibold text-sm bg-white"
          />
          <button
            onClick={addReminder}
            className="bg-[#3EC6F0] hover:bg-[#1AA6D9] text-white font-bold text-xs px-4 py-3 rounded-2xl transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Giờ
          </button>
        </div>
      </div>

      {/* SECTION 3: DAILY AI QUIZ CHALLENGE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#EAE4D4] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EAE4D4]">
          <div>
            <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#2B3350] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7ED957]" /> Thử Thách Trắc Nghiệm AI Hàng Ngày (10 Câu)
            </h3>
            <p className="text-xs text-[#6B7290] font-semibold mt-0.5">
              10 câu hỏi trắc nghiệm từ vựng, ngữ pháp &amp; collocations được phân chia chi tiết theo trình độ.
            </p>
          </div>

          <button
            onClick={() => loadQuiz(selectedLevel)}
            disabled={loadingQuiz}
            className="bg-[#EAF9FF] hover:bg-[#3EC6F0] hover:text-white text-[#1AA6D9] text-xs font-extrabold px-4 py-2 rounded-full border border-[#BEE9FF] transition-all cursor-pointer shrink-0"
          >
            {loadingQuiz ? 'Đang tạo...' : 'Tạo đề mới 🔄'}
          </button>
        </div>

        {/* Level Filter Selector */}
        <div className="mb-6 bg-[#FFFBF0] p-3 rounded-2xl border-2 border-[#EAE4D4]">
          <span className="block text-xs font-extrabold text-[#6B7290] uppercase tracking-wider mb-2">
            🎯 Chọn trình độ để làm bài:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'all', label: '🌟 Tất cả trình độ', count: '10 câu' },
              { id: 'basic', label: '🟢 Sơ cấp (A1 - A2)', count: '10 câu' },
              { id: 'intermediate', label: '🟡 Trung cấp (B1 - B2)', count: '10 câu' },
              { id: 'advanced', label: '🔴 Nâng cao (C1 - C2)', count: '10 câu' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => handleLevelChange(lvl.id)}
                className={`p-2.5 rounded-xl font-bold text-xs sm:text-sm border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                  selectedLevel === lvl.id
                    ? 'bg-[#3EC6F0] text-white border-[#1AA6D9] shadow-sm'
                    : 'bg-white text-[#2B3350] border-[#EAE4D4] hover:border-[#3EC6F0]'
                }`}
              >
                <span>{lvl.label}</span>
                <span className={`text-[10px] font-semibold ${selectedLevel === lvl.id ? 'text-white' : 'text-[#6B7290]'}`}>
                  {lvl.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loadingQuiz ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-3 border-[#EAE4D4] border-t-[#7ED957] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-[#6B7290]">AI đang biên soạn 10 câu hỏi theo trình độ bạn chọn...</p>
          </div>
        ) : quizQuestions.length > 0 ? (
          <div className="space-y-6">
            {quizQuestions.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];
              const badgeName =
                q.levelName ||
                (q.level === 'basic'
                  ? '🟢 Sơ cấp A1-A2'
                  : q.level === 'intermediate'
                  ? '🟡 Trung cấp B1-B2'
                  : '🔴 Nâng cao C1-C2');

              return (
                <div key={q.id} className="bg-[#FFFBF0] border-2 border-[#EAE4D4] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#1AA6D9]">
                      Câu {idx + 1} / {quizQuestions.length}
                    </span>
                    <span className="bg-white border border-[#EAE4D4] text-[#2B3350] font-extrabold text-[11px] px-2.5 py-0.5 rounded-full">
                      {badgeName}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[#2B3350]">{q.question}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      let btnStyle = 'bg-white border-[#EAE4D4] text-[#2B3350] hover:border-[#3EC6F0]';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-green-100 border-green-500 text-green-800 font-extrabold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-red-100 border-red-500 text-red-800 font-extrabold';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-[#3EC6F0] border-[#1AA6D9] text-white font-extrabold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`p-3 rounded-xl border-2 text-left text-sm transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-bold uppercase mr-2 font-mono">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-[#EAE4D4] text-xs font-semibold text-[#2B3350]">
                      💡 <span className="font-bold text-[#1AA6D9]">Giải thích:</span> {q.explanationVi}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quiz Submit Bar */}
            {!quizSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length < quizQuestions.length}
                className="w-full bg-[#7ED957] hover:bg-[#6ec248] text-white font-['Baloo_2'] font-extrabold text-lg py-4 rounded-2xl shadow-[0_4px_0_0_#59B639] transition-all cursor-pointer disabled:opacity-50"
              >
                Nộp Bài &amp; Xem Đáp Án ({Object.keys(userAnswers).length} / {quizQuestions.length})
              </button>
            ) : (
              <div className="bg-[#EAF9FF] border-2 border-[#3EC6F0] p-6 rounded-3xl text-center space-y-2">
                <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#1AA6D9]">
                  Kết quả: Bạn đúng {calculateScore()} / {quizQuestions.length} câu!
                </h3>
                <p className="text-xs font-bold text-[#6B7290]">
                  Thêm +2 từ vào mục tiêu hôm nay! Hãy tiếp tục duy trì nhé.
                </p>
                <button
                  onClick={() => loadQuiz(selectedLevel)}
                  className="mt-2 bg-[#1AA6D9] text-white text-xs font-bold px-4 py-2 rounded-full inline-block cursor-pointer"
                >
                  Làm đề trắc nghiệm khác
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
