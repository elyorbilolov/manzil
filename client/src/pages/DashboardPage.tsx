import React, { useState } from 'react';
import { UzbekistanSvgMap } from '../components/UzbekistanSvgMap';
import { ApplicationsTrendChart } from '../components/ApplicationsTrendChart';
import {
  MapPin,
  Mail,
  RotateCw,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  FileText,
  Building2,
  XCircle
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [mapMode, setMapMode] = useState<'manzillar' | 'arizalar'>('manzillar');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Top 5 regions by address count (exact values from screenshot)
  const topRegions = [
    { rank: 1, name: 'Samarqand viloyati', count: 611, countText: '611 ming', percentage: 100 },
    { rank: 2, name: 'Farg\'ona viloyati', count: 599, countText: '599 ming', percentage: 98 },
    { rank: 3, name: 'Andijon viloyati', count: 594, countText: '594 ming', percentage: 97 },
    { rank: 4, name: 'Toshkent shahri', count: 562, countText: '562 ming', percentage: 92 },
    { rank: 5, name: 'Qashqadaryo viloyati', count: 532, countText: '532 ming', percentage: 87 },
  ];

  // Integrations data from screenshot
  const integrations = [
    {
      name: 'OneID',
      status: 'Ishlayapti',
      percentage: '99,8%',
      barColor: 'bg-[#16a34a]',
      textColor: 'text-[#16a34a]',
      icon: 'check',
      lastExchange: '1 daqiqa oldin',
      width: '99.8%',
    },
    {
      name: 'DavReestr',
      status: 'Ishlayapti',
      percentage: '98,9%',
      barColor: 'bg-[#16a34a]',
      textColor: 'text-[#16a34a]',
      icon: 'check',
      lastExchange: '4 daqiqa oldin',
      width: '98.9%',
    },
    {
      name: 'E-qaror',
      status: 'Sekinlashgan',
      percentage: '91,2%',
      barColor: 'bg-[#f59e0b]',
      textColor: 'text-[#f59e0b]',
      icon: 'warning',
      lastExchange: '17 daqiqa oldin',
      width: '91.2%',
    },
    {
      name: 'SAP',
      status: 'Ishlayapti',
      percentage: '99,1%',
      barColor: 'bg-[#16a34a]',
      textColor: 'text-[#16a34a]',
      icon: 'check',
      lastExchange: '9 daqiqa oldin',
      width: '99.1%',
    },
    {
      name: 'Falcon',
      status: 'Uzilgan',
      percentage: '62,4%',
      barColor: 'bg-[#dc2626]',
      textColor: 'text-[#dc2626]',
      icon: 'disconnected',
      lastExchange: '3 soat oldin',
      width: '62.4%',
    },
  ];

  // Recent applications (exact rows from image 2)
  const recentApplications = [
    {
      id: 'A-2026-014582',
      address: 'Chilonzor tumani, Bunyodkor shoh ko\'chasi, 12-uy',
      region: 'Toshkent shahri',
      status: 'Yangi',
      statusType: 'blue',
      time: '6 daqiqa oldin',
    },
    {
      id: 'A-2026-014579',
      address: 'Urganch sh, Temur Malik ko\'chasi, 41-uy',
      region: 'Xorazm viloyati',
      status: 'Ko\'rib chiqilmoqda',
      statusType: 'amber',
      time: '23 daqiqa oldin',
    },
    {
      id: 'A-2026-014571',
      address: 'Samarqand sh, Registon ko\'chasi, 7-uy',
      region: 'Samarqand viloyati',
      status: 'Tasdiqlangan',
      statusType: 'green',
      time: '58 daqiqa oldin',
    },
    {
      id: 'A-2026-014566',
      address: 'Marg\'ilon sh, Burhoniddin Marg\'iloniy ko\'chasi, 3-uy',
      region: 'Farg\'ona viloyati',
      status: 'Rad etilgan',
      statusType: 'red',
      time: '1 soat oldin',
    },
    {
      id: 'A-2026-014560',
      address: 'Andijon sh, Bobur shoh ko\'chasi, 88-uy',
      region: 'Andijon viloyati',
      status: 'Tasdiqlangan',
      statusType: 'green',
      time: '2 soat oldin',
    },
    {
      id: 'A-2026-014553',
      address: 'Nukus sh, Amir Temur ko\'chasi, 15-uy',
      region: 'Qoraqalpog\'iston Respublikasi',
      status: 'Ko\'rib chiqilmoqda',
      statusType: 'amber',
      time: '3 soat oldin',
    },
  ];

  const getStatusBadge = (status: string, type: string) => {
    switch (type) {
      case 'blue':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
            <FileText className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'amber':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#fffbeb] text-[#d97706] border border-[#fde68a]">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'green':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
            <CheckCircle2 className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
            <XCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
            Xayrli kun, ELYOR
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Manzillar reyestri bo'yicha hududlar kesimidagi holat
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#fefce8] text-[#a16207] border border-[#fef08a] hover:bg-[#fef9c3] transition-colors shadow-2xs"
          >
            Namunaviy ma'lumot
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs flex items-center space-x-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Reyestrdagi manzillar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Reyestrdagi manzillar</span>
            <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">5 907 389</div>
            <div className="text-[11px] font-medium text-[#16a34a] mt-1 flex items-center">
              <span className="mr-1">↗</span>
              <span>+2,4% o'tgan oyga nisbatan</span>
            </div>
          </div>
        </div>

        {/* Card 2: Yangi arizalar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Yangi arizalar</span>
            <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">161</div>
            <div className="text-[11px] font-medium text-[#16a34a] mt-1 flex items-center">
              <span className="mr-1">↗</span>
              <span>+12,5% o'tgan haftaga nisbatan</span>
            </div>
          </div>
        </div>

        {/* Card 3: Ko'rib chiqilmoqda */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Ko'rib chiqilmoqda</span>
            <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">368</div>
            <div className="text-[11px] font-medium text-[#16a34a] mt-1 flex items-center">
              <span className="mr-1">↘</span>
              <span>-4,1% o'tgan haftaga nisbatan</span>
            </div>
          </div>
        </div>

        {/* Card 4: O'rtacha ko'rib chiqish muddati */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">O'rtacha ko'rib chiqish muddati</span>
            <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">3,6 kun</div>
            <div className="text-[11px] font-medium text-[#16a34a] mt-1 flex items-center">
              <span className="mr-1">↘</span>
              <span>-0,4 kun o'tgan oyga nisbatan</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Map + O'zbekiston bo'yicha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Hududlar xaritasi (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Hududlar xaritasi</h3>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setMapMode('manzillar')}
                className={`px-3 py-1 rounded-md transition-all ${
                  mapMode === 'manzillar'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Manzillar
              </button>
              <button
                onClick={() => setMapMode('arizalar')}
                className={`px-3 py-1 rounded-md transition-all ${
                  mapMode === 'arizalar'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Arizalar (shu oy)
              </button>
            </div>
          </div>

          {/* Svg Map Container */}
          <div className="w-full my-auto py-2">
            <UzbekistanSvgMap
              mode={mapMode}
              selectedRegion={selectedRegion}
              onSelectRegion={reg => setSelectedRegion(reg === selectedRegion ? null : reg)}
            />
          </div>

          {/* Map Color Legend */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-600">
            <span className="font-medium text-slate-500">Manzillar:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#60a5fa] inline-block"></span>
              <span>136 ming – 212 ming</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#3b82f6] inline-block"></span>
              <span>212 ming – 380 ming</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#2563eb] inline-block"></span>
              <span>380 ming – 490 ming</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#1d4ed8] inline-block"></span>
              <span>490 ming – 594 ming</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#1e3a8a] inline-block"></span>
              <span>594 ming – 611 ming</span>
            </div>
          </div>
        </div>

        {/* Right: O'zbekiston bo'yicha (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">O'zbekiston bo'yicha</h3>
              <p className="text-xs text-slate-400 mt-2">Jami manzillar</p>
              <div className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                5 907 389
              </div>
              <p className="text-xs text-slate-400 mt-0.5">14 ta hududda</p>
            </div>

            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
                ENG KO'P MANZIL
              </div>

              {/* Progress bars list */}
              <div className="space-y-3.5">
                {topRegions.map(item => (
                  <div key={item.rank} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">
                        <strong className="font-semibold text-slate-400 mr-1.5">{item.rank}</strong>
                        {item.name}
                      </span>
                      <span className="font-medium text-slate-700 font-mono text-[11px]">
                        {item.countText}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2563eb] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Tip / Help banner */}
          <div className="mt-5 p-3 rounded-xl bg-[#eff6ff] text-[#2563eb] text-[11px] flex items-center space-x-2">
            <span className="font-semibold text-xs">ℹ</span>
            <span>Batafsil ko'rish uchun xaritadan viloyatni tanlang</span>
          </div>
        </div>
      </div>

      {/* 4. Lower-Middle Section: Trend Chart + Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Arizalar dinamikasi (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <ApplicationsTrendChart />
        </div>

        {/* Right: Integratsiyalar (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-4">Integratsiyalar</h3>

            <div className="space-y-4">
              {integrations.map(item => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className={`text-[11px] font-semibold flex items-center space-x-1 ${item.textColor}`}>
                      {item.icon === 'check' && <span>✔</span>}
                      {item.icon === 'warning' && <span>⚠</span>}
                      {item.icon === 'disconnected' && <span>⚡</span>}
                      <span>{item.status}</span>
                      <span className="font-mono">{item.percentage}</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${item.barColor}`}
                      style={{ width: item.width }}
                    ></div>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Oxirgi almashinuv: {item.lastExchange}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Section: So'nggi arizalar Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">So'nggi arizalar</h3>
          <button
            onClick={() => onNavigate('workflow-c01')}
            className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] flex items-center space-x-1 transition-colors"
          >
            <span>Barchasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-400 font-semibold border-b border-slate-100 text-[11px]">
              <tr>
                <th className="py-3 px-6">Ariza №</th>
                <th className="py-3 px-6">Manzil</th>
                <th className="py-3 px-6">Hudud</th>
                <th className="py-3 px-6">Holati</th>
                <th className="py-3 px-6 text-right">Vaqti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentApplications.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-medium text-slate-900">
                    {app.id}
                  </td>
                  <td className="py-3.5 px-6 font-normal text-slate-800">
                    {app.address}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {app.region}
                  </td>
                  <td className="py-3.5 px-6">
                    {getStatusBadge(app.status, app.statusType)}
                  </td>
                  <td className="py-3.5 px-6 text-right text-slate-400 font-normal">
                    {app.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Footer */}
      <div className="pt-2 pb-6 text-center text-xs text-slate-400">
        © Barcha huquqlar <span className="text-slate-600 font-medium">"Geoinfocom" DM</span> tomonidan himoyalangan
      </div>
    </div>
  );
};
