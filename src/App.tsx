import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TabsNavigation } from './components/TabsNavigation';
import { DictionaryTab } from './components/DictionaryTab';
import { Vocab1000Tab } from './components/Vocab1000Tab';
import { WritingTab } from './components/WritingTab';
import { PronunciationTab } from './components/PronunciationTab';
import { RemindersTab } from './components/RemindersTab';
import { AppTab } from './types';
import { getStreakInfo, getDailyGoals } from './utils/storageUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dict');
  const [streak, setStreak] = useState(getStreakInfo());
  const [dailyGoal, setDailyGoal] = useState(getDailyGoals());

  // Refresh stats whenever switching tabs
  useEffect(() => {
    setStreak(getStreakInfo());
    setDailyGoal(getDailyGoals());
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-[#2B3350] font-['Quicksand',sans-serif] selection:bg-[#3EC6F0] selection:text-white">
      {/* Top Header */}
      <Header streak={streak} dailyGoal={dailyGoal} />

      {/* Navigation Tabs */}
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Active Tab View */}
      <main className="mt-2">
        {activeTab === 'dict' && <DictionaryTab />}
        {activeTab === 'vocab1000' && <Vocab1000Tab />}
        {activeTab === 'writing' && <WritingTab />}
        {activeTab === 'pronunciation' && <PronunciationTab />}
        {activeTab === 'reminders' && <RemindersTab />}
      </main>

      {/* Footer & Contact Info */}
      <footer className="py-8 px-4 border-t border-[#EAE4D4] mt-12 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Brand Info */}
          <div>
            <h4 className="font-['Baloo_2'] text-lg font-bold text-[#1AA6D9] flex items-center justify-center sm:justify-start gap-2">
              <span>Ms Lý AI</span>
              <span className="text-[#FF8C7A]">•</span>
              <span>Fly High With English 🐦</span>
            </h4>
            <p className="text-xs font-semibold text-[#6B7290] mt-0.5">
              Hệ thống từ điển thông minh &amp; trợ lý luyện nói, viết tiếng Anh AI
            </p>
          </div>

          {/* Contact Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.facebook.com/nguyen.ly.254892/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#0c63d4] transition-all hover:scale-105 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook Ms Lý</span>
            </a>

            <a
              href="https://zalo.me/0962859488"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0068FF] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#0052cc] transition-all hover:scale-105 cursor-pointer"
            >
              <span className="bg-white text-[#0068FF] text-[10px] font-black px-1.5 py-0.5 rounded">ZALO</span>
              <span>0962 859 488</span>
            </a>
          </div>
        </div>

        <div className="text-center text-[11px] font-bold text-[#6B7290] mt-6 pt-4 border-t border-[#EAE4D4]/50">
          © {new Date().getFullYear()} Ms Lý AI • All rights reserved • Powered by Gemini 3.6 AI
        </div>
      </footer>
    </div>
  );
}
