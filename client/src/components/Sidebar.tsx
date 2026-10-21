import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  FilePlus2,
  FileText,
  Users,
  BookOpen,
  Headphones,
  Settings,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Navigation
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
  const [addressCreationOpen, setAddressCreationOpen] = useState(false);
  const [currentAddressModOpen, setCurrentAddressModOpen] = useState(false);
  const [newAddressSubOpen, setNewAddressSubOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);
  const [cancellationsSubOpen, setCancellationsSubOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dataManagementOpen, setDataManagementOpen] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* 1. Profil qismi: BILOLOV ELYOR / Admin */}
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

      {/* 2. Menyu ketma-ketligi:
             1. Monitoring (Dashboard)
             2. Manzil yaratish va o'zgartirish
                1) Joriy manzillarni o'zgartirish
                   • Yangi arizalar
                   • Jarayonda
                   • Yakunlangan
                   • Rad etilgan
                2) Bog'lash nuqta va/yoki chiziqlarni yaratish
                3) Yangi manzil yaratish
                   • Yangi arizalar
                   • Jarayonda
                   • Yakunlangan
                   • Rad etilgan
             3. Reyestr
             4. Foydalanuvchilar
             5. Qo'llanma
             6. Texnik ko'mak
             7. Sozlamalar
      */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2 text-xs font-['Inter',sans-serif]">
        
        {/* 1. Monitoring (Dashboard) */}
        <div>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs transition-all ${
              currentTab === 'dashboard'
                ? 'bg-[#2563eb] text-white shadow-sm font-semibold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <LayoutGrid className={`w-4 h-4 flex-shrink-0 ${currentTab === 'dashboard' ? 'text-white' : 'text-slate-500'}`} />
            <span className="truncate">Monitoring (Dashboard)</span>
          </button>
        </div>

        {/* 2. Manzil yaratish va o'zgartirish (Akkordeon) */}
        <div className="space-y-1">
          <button
            onClick={() => setAddressCreationOpen(!addressCreationOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab.startsWith('change-address') ||
              currentTab === 'connecting-points-lines' ||
              currentTab.startsWith('new-address')
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FilePlus2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-left font-medium text-slate-800 leading-tight">
                Manzil yaratish va o'zgartirish
              </span>
            </div>
            {addressCreationOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
          </button>

          {/* Ichki bo'limlar: 1), 2), 3) */}
          {addressCreationOpen && (
            <div className="pl-3 pr-1 pt-0.5 space-y-1.5 border-l-2 border-slate-100 ml-3.5 mt-0.5 text-slate-700">
              
              {/* Joriy manzillarni o'zgartirish (Ichki akkordeon) */}
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
                    {/* • Yangi arizalar */}
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

                    {/* • Jarayonda */}
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

                    {/* • Yakunlangan */}
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

                    {/* • Rad etilgan */}
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

              {/* Bog'lash nuqta va/yoki chiziqlarni yaratish */}
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

              {/* Yangi manzil yaratish (Ichki akkordeon) */}
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
                    {/* • Yangi arizalar */}
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

                    {/* • Jarayonda */}
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

                    {/* • Yakunlangan */}
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

                    {/* • Rad etilgan */}
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

        {/* 3. Reyestr (Akkordeon) */}
        <div className="space-y-1">
          <button
            onClick={() => setRegistryOpen(!registryOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'registry' || currentTab.startsWith('cancellations')
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-left font-medium text-slate-800">
                Reyestr
              </span>
            </div>
            {registryOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Sub-items: Manzil to'g'risidagi ma'lumotlarni olish & Manzillarni o'chirish */}
          {registryOpen && (
            <div className="pl-3 pr-1 pt-0.5 space-y-1.5 border-l-2 border-slate-100 ml-3.5 mt-0.5 text-slate-700">
              {/* Manzil to'g'risidagi ma'lumotlarni olish */}
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

              {/* Manzillarni o'chirish (Ichki akkordeon) */}
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
                    {/* • Yangi arizalar */}
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

                    {/* • Jarayonda */}
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

                    {/* • Yakunlangan */}
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

                    {/* • Rad etilgan */}
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

        {/* 4. Foydalanuvchilar (Akkordeon) */}
        <div>
          <button
            onClick={() => setUsersOpen(!usersOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'users' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="font-medium text-slate-800">Foydalanuvchilar</span>
            </div>
            {usersOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {usersOpen && (
            <div className="pl-6 pr-2 pt-1 border-l-2 border-slate-100 ml-4 mt-0.5">
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

        {/* 5. Qo'llanma */}
        <div>
          <button
            onClick={() => setCurrentTab('guide')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs transition-all ${
              currentTab === 'guide'
                ? 'bg-[#2563eb] text-white shadow-sm font-semibold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <BookOpen className={`w-4 h-4 flex-shrink-0 ${currentTab === 'guide' ? 'text-white' : 'text-slate-500'}`} />
            <span className="font-medium truncate">Qo'llanma</span>
          </button>
        </div>

        {/* 6. Texnik ko'mak (SMS kelganda yonib-o'chib turuvchi nishon bilan) */}
        <div>
          <button
            type="button"
            onClick={() => {
              setCurrentTab('support');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              currentTab === 'support'
                ? 'bg-[#2563eb] text-white shadow-sm font-semibold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Headphones className={`w-4 h-4 flex-shrink-0 ${currentTab === 'support' ? 'text-white' : 'text-slate-500'}`} />
                {unreadSmsCount > 0 && currentTab !== 'support' && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <span className="font-medium truncate">Texnik ko'mak</span>
            </div>

            {/* Glowing / Pulsing SMS Badge */}
            {unreadSmsCount > 0 && currentTab !== 'support' ? (
              <span className="flex items-center space-x-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                <MessageSquare className="w-2.5 h-2.5" />
                <span>{unreadSmsCount} ta SMS</span>
              </span>
            ) : (
              <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${currentTab === 'support' ? 'text-white' : 'text-slate-400'}`} />
            )}
          </button>
        </div>

        {/* 7. Sozlamalar (Akkordeon) */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'settings' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="font-medium text-slate-800">Sozlamalar</span>
            </div>
            {settingsOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {settingsOpen && (
            <div className="pl-6 pr-2 pt-1 border-l-2 border-slate-100 ml-4 mt-0.5 space-y-1">
              {/* Nested: Tizim va ma'lumotlarni boshqarish */}
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

                {/* Sub items: Pochta indeksi, Viloyatlar, Tumanlar, Mahallalar, Ko'chalar */}
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
                    <button
                      onClick={() => setCurrentTab('settings')}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 transition-colors flex items-center space-x-2"
                    >
                      <span className="text-slate-400">•</span>
                      <span>Mahallalar</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('settings')}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-50 transition-colors flex items-center space-x-2"
                    >
                      <span className="text-slate-400">•</span>
                      <span>Ko'chalar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </nav>
    </aside>
  );
};
