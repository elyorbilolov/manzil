import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SystemSettings } from '../types';
import {
  Settings,
  Save,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Shield,
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getSettings();
        if (res.success) setSettings(res.settings);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Tizim Konfiguratsiyasi va Parametrlari</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          TTZ 4.2.6 (Созламалар) va 4.2.16 (Тизимни ва маълумотларни бошқариш)
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 text-xs">
        {/* System Limits & Rules */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Texnik Cheklovlar va Reglament Parametrlari:</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bog'lash chizig'i maksimal uzunligi (metrda):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.maxConnectingLineMeters}
                  onChange={e => setSettings({ ...settings, maxConnectingLineMeters: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                  min={10}
                  max={100}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">metr</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                TTZ 4.2.11 talabi: 50 metrdan oshmasligi kerak.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standart Invoys to'lov summasi:
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.defaultInvoiceAmountUzs}
                  onChange={e => setSettings({ ...settings, defaultInvoiceAmountUzs: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">so'm</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Pullik xizmat ko'rsatish tariflari bo'yicha</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Avtomatik Geokod davlat prefiksi:
              </label>
              <input
                type="text"
                value={settings.autoGeocodePrefix}
                onChange={e => setSettings({ ...settings, autoGeocodePrefix: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">Masalan: UZ (O'zbekiston kodi)</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sessiya yashash vaqti (daqiqa):
              </label>
              <input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={e => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">Xavfsizlik siyosati bo'yicha</p>
            </div>
          </div>
        </div>

        {/* Integration and Automated Processing Flags */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Avtomatlashtirilgan Jarayonlar va Sinxronizatsiya:</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.uzkadAutoRemovalEnabled}
                onChange={e => setSettings({ ...settings, uzkadAutoRemovalEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 block">UZKAD C-03 Avtomatik o'chirish faol</span>
                <span className="text-[11px] text-slate-500">
                  UZKADdan mulk buzilganligi xabarnomasi kelganda darhol (&lt;5 min) manzilni bekor qilish
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.geonamesAutoValidation}
                onChange={e => setSettings({ ...settings, geonamesAutoValidation: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 block">Geonames Ko'chalar reestri bilan tekshirish</span>
                <span className="text-[11px] text-slate-500">
                  Ko'cha nomi faqat Davlat reestridagi rasmiy nomlar asosida kiritilishini talab etish
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireOneIdForStaff}
                onChange={e => setSettings({ ...settings, requireOneIdForStaff: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 block">Xodimlar uchun OneID SSO majburiy</span>
                <span className="text-[11px] text-slate-500">
                  Kadastr palatasi barcha xodimlari OneID orqali JSHSHIR bilan kiradi
                </span>
              </div>
            </label>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
