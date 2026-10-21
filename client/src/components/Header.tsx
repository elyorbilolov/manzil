import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Menu,
  Moon,
  Send,
  Bell,
  LogOut,
  Shield
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 h-16">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand Logo & Hamburger */}
        <div className="flex items-center space-x-3">
          {/* Logo Badge */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shadow-sm">
              <MapPin className="w-5 h-5 fill-white stroke-none" />
            </div>
            <div>
              <div className="font-extrabold text-[#0f172a] text-[15px] leading-none tracking-tight">
                Manzillar
              </div>
              <div className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1 leading-none">
                REYESTRI
              </div>
            </div>
          </div>

          {/* Hamburger Menu button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors ml-2"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action Icons & Online status */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Online badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-[#f0fdf4] text-xs font-semibold text-[#16a34a]">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
            <span>0 online</span>
          </div>

          {/* Dark mode button */}
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] flex items-center justify-center transition-colors"
            title="Tungi rejim"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Telegram channel button */}
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] flex items-center justify-center transition-colors"
            title="Telegram kanal"
          >
            <Send className="w-4 h-4 -rotate-45" />
          </a>

          {/* Notifications bell */}
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] flex items-center justify-center transition-colors relative"
            title="Bildirishnomalar"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Logout button */}
          <button
            type="button"
            onClick={logout}
            className="w-9 h-9 rounded-xl bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] flex items-center justify-center transition-colors"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
