import React from 'react';
import { BookOpen, Sparkles, PenTool, Mic, Bell } from 'lucide-react';
import { AppTab } from '../types';

interface TabsNavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'dict' as AppTab,
      label: '📖 Tra Từ & Đọc',
      icon: BookOpen,
      badge: 'EN-VI',
      activeColor: 'bg-[#3EC6F0] text-white border-[#1AA6D9] shadow-[#1AA6D9]',
    },
    {
      id: 'vocab1000' as AppTab,
      label: '📚 1000 Từ & Game',
      icon: Sparkles,
      badge: 'Chủ đề',
      activeColor: 'bg-[#8B5CF6] text-white border-[#7C3AED] shadow-[#7C3AED]',
    },
    {
      id: 'writing' as AppTab,
      label: '✍️ Luyện Viết AI',
      icon: PenTool,
      badge: 'Sửa lỗi',
      activeColor: 'bg-[#FF8C7A] text-white border-[#E2604C] shadow-[#E2604C]',
    },
    {
      id: 'pronunciation' as AppTab,
      label: '🎙️ Chấm Phát Âm',
      icon: Mic,
      badge: 'Ghi âm',
      activeColor: 'bg-[#7ED957] text-white border-[#59B639] shadow-[#59B639]',
    },
    {
      id: 'reminders' as AppTab,
      label: '🔔 Nhắc Nhở & Bài Học',
      icon: Bell,
      badge: 'Mỗi ngày',
      activeColor: 'bg-[#FFCF44] text-[#2B3350] border-[#E2A200] shadow-[#E2A200]',
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-4 px-2 max-w-4xl mx-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-['Baloo_2'] text-sm sm:text-base font-bold py-2.5 px-4 sm:px-5 rounded-full border-2 transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              isActive
                ? `${tab.activeColor} shadow-[0_4px_0_0_rgba(0,0,0,0.15)] -translate-y-0.5`
                : 'bg-white text-[#6B7290] border-[#EAE4D4] hover:border-[#3EC6F0] hover:text-[#2B3350] shadow-sm'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isActive ? 'bg-white/20 text-current' : 'bg-[#FFFBF0] text-[#6B7290] border border-[#EAE4D4]'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
};
