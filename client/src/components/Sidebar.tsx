import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  MapPin,
  FileText,
  Users,
  BookOpen,
  Settings,
  Headphones,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingCount?: number;
  unreadSmsCount?: number;
  onOpenChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  pendingCount,
  unreadSmsCount = 1,
  onOpenChat,
}) => {
  const { user } = useAuth();

  // Accordion states (default to closed as requested)
  const [registryOpen, setRegistryOpen] = useState(false);
  const [cancellationsSubOpen, setCancellationsSubOpen] = useState(false);
  const [addressCreationOpen, setAddressCreationOpen] = useState(false);
  const [currentAddressModOpen, setCurrentAddressModOpen] = useState(false);
  const [newAddressSubOpen, setNewAddressSubOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dataManagementOpen, setDataManagementOpen] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col h-[calc(100vh-4rem)] select-none font-['Inter',sans-serif]">
      {/* Profil qismi: BILOLOV ELYOR / Admin */}
      <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100 shadow-2xs"
          style={{
            backgroundImage: "url('/sidebar-reference.png')",
            backgroundPosition: '-20px -92px',
            backgroundSize: '258px auto',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="min-w-0">
          <div className="font-extrabold text-[#0f172a] text-xs uppercase tracking-tight truncate">
            BILOLOV ELYOR
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* Navigatsiya menyusi — 1:1 skrinshot asosida */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-xs">
        
        {/* ================= 1. ASOSIY ================= */}
        <div>
          <div className="px-3 pb-1.5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            ASOSIY
          </div>
          
          {/* Monitoring (Solid Blue when active) */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              currentTab === 'dashboard'
                ? 'bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/25'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <LayoutGrid
              className={`w-4 h-4 flex-shrink-0 ${
                currentTab === 'dashboard' ? 'text-white' : 'text-slate-500'
              }`}
            />
            <span className="truncate">Monitoring</span>
          </button>
        </div>

        {/* ================= 2. REYESTR VA MANZILLAR ================= */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            REYESTR VA MANZILLAR
          </div>

          {/* 📍 Reyestr (Akkordeon - bosganda 2 ta bo'lim ochiladi) */}
          <div className="space-y-0.5">
            <button
              onClick={() => setRegistryOpen(!registryOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'registry' || currentTab.startsWith('cancellations')
                  ? 'text-blue-600 bg-blue-50/60 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MapPin
                  className={`w-4 h-4 flex-shrink-0 ${
                    currentTab === 'registry' || currentTab.startsWith('cancellations')
                      ? 'text-blue-600'
                      : 'text-slate-500'
                  }`}
                />
                <span className="font-medium text-slate-800">Reyestr</span>
              </div>
              {registryOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>

            {/* Reyestr ichidagi 2 ta bo'lim: */}
            {registryOpen && (
              <div className="pl-3 pr-1 pt-1 space-y-1.5 border-l-2 border-slate-100 ml-3.5 mt-0.5 text-slate-700">
                {/* 1. Manzil to'g'risidagi ma'lumotlarni olish */}
                <div>
                  <button
                    onClick={() => setCurrentTab('registry')}
                    className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors text-xs font-medium flex items-center justify-between ${
                      currentTab === 'registry'
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="leading-tight">
                      Manzil to'g'risidagi ma'lumotlarni olish
                    </span>
                  </button>
                </div>

                {/* 2. Manzillarni o'chirish */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => setCancellationsSubOpen(!cancellationsSubOpen)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-xs text-slate-800"
                  >
                    <span className="text-left font-medium leading-tight">
                      Manzillarni o'chirish
                    </span>
                    {cancellationsSubOpen ? (
                      <ChevronUp className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {cancellationsSubOpen && (
                    <div className="pl-3 space-y-0.5 pt-0.5 border-l border-slate-100 ml-2">
                      <button
                        onClick={() => setCurrentTab('cancellations-new')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'cancellations-new' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Yangi arizalar</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          1
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('cancellations-in-progress')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'cancellations-in-progress' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Jarayonda</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          1
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('cancellations-completed')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'cancellations-completed' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Yakunlangan</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          2
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('cancellations-rejected')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'cancellations-rejected' ? 'bg-slate-100 font-bold text-rose-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Rad etilgan</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          1
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 📄 Manzil yaratish va o'zgartirish (Accordion) */}
          <div>
            <button
              onClick={() => setAddressCreationOpen(!addressCreationOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab.startsWith('change-address') ||
                currentTab === 'connecting-points-lines' ||
                currentTab.startsWith('new-address')
                  ? 'text-blue-600 bg-blue-50/60 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="text-left font-medium text-slate-800 leading-snug">
                  Manzil yaratish va<br />o'zgartirish
                </span>
              </div>
              {addressCreationOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>

            {/* Manzil yaratish va o'zgartirish ichki bandlari */}
            {addressCreationOpen && (
              <div className="pl-3 pr-1 pt-1 space-y-1.5 border-l-2 border-slate-100 ml-3.5 mt-0.5 text-slate-700">
                
                {/* 1. Joriy manzillarni o'zgartirish */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => setCurrentAddressModOpen(!currentAddressModOpen)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-xs text-slate-800"
                  >
                    <span className="text-left font-medium leading-tight">
                      Joriy manzillarni o'zgartirish
                    </span>
                    {currentAddressModOpen ? (
                      <ChevronUp className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {currentAddressModOpen && (
                    <div className="pl-3 space-y-0.5 pt-0.5 border-l border-slate-100 ml-2">
                      <button
                        onClick={() => setCurrentTab('change-address-new')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'change-address-new' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Yangi arizalar</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          2
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('change-address-in-progress')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'change-address-in-progress' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Jarayonda</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          1
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('change-address-completed')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'change-address-completed' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Yakunlangan</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          3
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('change-address-rejected')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'change-address-rejected' ? 'bg-slate-100 font-bold text-rose-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Rad etilgan</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          1
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Bog'lash nuqta va/yoki chiziqlarni yaratish */}
                <div>
                  <button
                    onClick={() => setCurrentTab('connecting-points-lines')}
                    className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors text-xs font-medium flex items-center justify-between ${
                      currentTab === 'connecting-points-lines'
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="leading-tight">
                      Bog'lash nuqta va/yoki chiziqlarni yaratish
                    </span>
                  </button>
                </div>

                {/* 3. Yangi manzil yaratish */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => setNewAddressSubOpen(!newAddressSubOpen)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-xs text-slate-800"
                  >
                    <span className="text-left font-medium leading-tight">
                      Yangi manzil yaratish
                    </span>
                    {newAddressSubOpen ? (
                      <ChevronUp className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {newAddressSubOpen && (
                    <div className="pl-3 space-y-0.5 pt-0.5 border-l border-slate-100 ml-2">
                      <button
                        onClick={() => setCurrentTab('new-address-new')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'new-address-new' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Yangi arizalar</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          3
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('new-address-in-progress')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'new-address-in-progress' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Jarayonda</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          2
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('new-address-completed')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'new-address-completed' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Yakunlangan</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          5
                        </span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('new-address-rejected')}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-[11px] ${
                          currentTab === 'new-address-rejected' ? 'bg-slate-100 font-bold text-rose-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">•</span>
                          <span>Rad etilgan</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#0ea5e9] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                          1
                        </span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ================= 3. BOSHQARUV ================= */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            BOSHQARUV
          </div>

          {/* 👥 Foydalanuvchilar (Accordion) */}
          <div>
            <button
              onClick={() => setUsersOpen(!usersOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'users' ? 'text-blue-600 bg-blue-50/60 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-medium text-slate-800">Foydalanuvchilar</span>
              </div>
              {usersOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>

            {usersOpen && (
              <div className="pl-6 pr-2 pt-1 border-l-2 border-slate-100 ml-4 mt-0.5 space-y-1">
                <button
                  onClick={() => setCurrentTab('users')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors text-xs flex items-center space-x-2 ${
                    currentTab === 'users' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-slate-400">•</span>
                  <span>Foydalanuvchilarni boshqarish</span>
                </button>
              </div>
            )}
          </div>

          {/* 📖 Qo'llanma (Accordion) */}
          <div>
            <button
              onClick={() => setGuideOpen(!guideOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab.startsWith('guide') ? 'text-blue-600 bg-blue-50/60 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-medium text-slate-800">Qo'llanma</span>
              </div>
              {guideOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>

            {guideOpen && (
              <div className="pl-6 pr-2 pt-1 border-l-2 border-slate-100 ml-4 mt-0.5 space-y-1">
                <button
                  onClick={() => setCurrentTab('guide')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors text-xs flex items-center space-x-2 ${
                    currentTab === 'guide' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-slate-400">•</span>
                  <span>Tizimdan foydalanish yo'riqnomasi</span>
                </button>
              </div>
            )}
          </div>

          {/* ⚙️ Sozlamalar (Accordion) */}
          <div>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'settings' || currentTab === 'audit-logs' || currentTab === 'integrations'
                  ? 'text-blue-600 bg-blue-50/60 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-medium text-slate-800">Sozlamalar</span>
              </div>
              {settingsOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>

            {settingsOpen && (
              <div className="pl-6 pr-2 pt-1 border-l-2 border-slate-100 ml-4 mt-0.5 space-y-1">
                <div>
                  <button
                    onClick={() => setDataManagementOpen(!dataManagementOpen)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-xs text-slate-800"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">•</span>
                      <span className="text-left leading-tight font-medium">Tizim va ma'lumotlarni boshqarish</span>
                    </div>
                    {dataManagementOpen ? (
                      <ChevronUp className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {dataManagementOpen && (
                    <div className="pl-5 space-y-0.5 pt-1 text-slate-600">
                      <button
                        onClick={() => setCurrentTab('settings')}
                        className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 transition-colors flex items-center space-x-2"
                      >
                        <span className="text-slate-400">•</span>
                        <span>Pochta indeksi</span>
                      </button>
                      <button
                        onClick={() => setCurrentTab('settings')}
                        className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 transition-colors flex items-center space-x-2"
                      >
                        <span className="text-slate-400">•</span>
                        <span>Viloyatlar</span>
                      </button>
                      <button
                        onClick={() => setCurrentTab('settings')}
                        className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 transition-colors flex items-center space-x-2"
                      >
                        <span className="text-slate-400">•</span>
                        <span>Tumanlar</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setCurrentTab('audit-logs')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors text-xs flex items-center space-x-2 ${
                    currentTab === 'audit-logs' ? 'bg-slate-100 font-bold text-blue-600' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-slate-400">•</span>
                  <span>Tizim auditi va jurnallar</span>
                </button>
              </div>
            )}
          </div>

          {/* 💬 Texnik ko'mak (Foydalanuvchi iltimosiga ko'ra saqlandi: "texnik komak turaversin ularda yoq") */}
          <div>
            <button
              type="button"
              onClick={() => setCurrentTab('support')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                currentTab === 'support'
                  ? 'bg-blue-50/80 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Headphones
                    className={`w-4 h-4 flex-shrink-0 ${
                      currentTab === 'support' ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  />
                  {unreadSmsCount > 0 && currentTab !== 'support' && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </div>
                <span className="font-medium truncate">Texnik ko'mak</span>
              </div>

              {/* Pulsing SMS badge */}
              {unreadSmsCount > 0 && currentTab !== 'support' ? (
                <span className="flex items-center space-x-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                  <MessageSquare className="w-2.5 h-2.5" />
                  <span>{unreadSmsCount} ta SMS</span>
                </span>
              ) : (
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>
          </div>

        </div>

      </nav>
    </aside>
  );
};
