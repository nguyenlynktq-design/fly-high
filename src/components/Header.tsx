import React from 'react';
import { Flame, Target, Sparkles, BookOpen, Volume2 } from 'lucide-react';
import { StreakInfo } from '../utils/storageUtils';
import { DailyGoal } from '../types';

interface HeaderProps {
  streak: StreakInfo;
  dailyGoal: DailyGoal;
}

export const Header: React.FC<HeaderProps> = ({ streak, dailyGoal }) => {
  const goalProgress = Math.min(
    100,
    Math.round(
      ((dailyGoal.learnedWords + dailyGoal.completedWriting + dailyGoal.completedSpeaking) /
        (dailyGoal.targetWords + dailyGoal.targetWriting + dailyGoal.targetSpeaking)) *
        100
    )
  );

  return (
    <header className="pt-6 pb-4 px-4 max-w-5xl mx-auto text-center relative">
      {/* Top Banner Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-[#EAE4D4] shadow-sm">
        {/* Streak Badge */}
        <div className="flex items-center gap-2 bg-[#FFF3E0] px-3 py-1.5 rounded-full border border-[#FFE0B2]">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-sm font-bold text-orange-900">
            {streak.count} Ngày liên tiếp
          </span>
        </div>

        {/* Brand Tagline & Contact Links */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="hidden md:flex items-center gap-1.5 text-[#1AA6D9] uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-[#FFCF44]" />
            Ms Lý AI • Fly High
          </div>

          {/* Facebook & Zalo badges */}
          <a
            href="https://www.facebook.com/nguyen.ly.254892/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white px-2.5 py-1 rounded-full border border-[#1877F2]/20 transition-all text-xs font-bold cursor-pointer"
            title="Facebook Ms Lý AI"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="hidden sm:inline">Facebook</span>
          </a>

          <a
            href="https://zalo.me/0962859488"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#0068FF]/10 text-[#0068FF] hover:bg-[#0068FF] hover:text-white px-2.5 py-1 rounded-full border border-[#0068FF]/20 transition-all text-xs font-bold cursor-pointer"
            title="Zalo / SĐT: 0962859488"
          >
            <span className="bg-[#0068FF] text-white text-[9px] font-black px-1 rounded">Zalo</span>
            <span>0962 859 488</span>
          </a>
        </div>

        {/* Daily Goal Badge */}
        <div className="flex items-center gap-2 bg-[#EAF9FF] px-3 py-1.5 rounded-full border border-[#BEE9FF]">
          <Target className="w-4 h-4 text-[#1AA6D9]" />
          <span className="text-xs font-bold text-[#1AA6D9]">
            Mục tiêu: {goalProgress}%
          </span>
          <div className="w-12 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#3EC6F0] h-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Animated Mascot & App Title */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 mb-2 group cursor-pointer">
          <svg className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105" viewBox="0 0 100 100">
            <ellipse cx="50" cy="60" rx="30" ry="26" fill="#FFCF44" />
            <ellipse cx="30" cy="55" rx="14" ry="9" fill="#3EC6F0" transform="rotate(-20 30 55)" />
            <circle cx="66" cy="46" r="9" fill="#FFFBF0" />
            <circle cx="69" cy="44" r="3.2" fill="#2B3350" />
            <path d="M75 46 l10 3 l-10 4 z" fill="#FF8C7A" />
            <path d="M45 82 l-6 10 M55 82 l4 10" stroke="#E2A200" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="absolute -top-1 -right-1 bg-[#FF8C7A] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
            AI 3.6
          </div>
        </div>

        <h1 className="font-['Baloo_2'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1AA6D9] tracking-tight leading-tight">
          Fly High <span className="text-[#FF8C7A]">Dictionary</span>
        </h1>
        <p className="text-sm sm:text-base text-[#6B7290] font-semibold mt-1 max-w-xl mx-auto">
          Tra từ chuẩn bản xứ, luyện viết AI sửa lỗi ngữ pháp, chấm điểm phát âm ghi âm &amp; hệ thống nhắc nhở học tập thông minh mỗi ngày!
        </p>
      </div>
    </header>
  );
};
