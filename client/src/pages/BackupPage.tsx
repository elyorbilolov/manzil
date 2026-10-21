import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Address } from '../types';
import {
  HardDriveDownload,
  Upload,
  Archive,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

export const BackupPage: React.FC = () => {
  const [archivedAddresses, setArchivedAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAddresses({ status: 'cancelled' });
      if (res.success) {
        setArchivedAddresses(res.addresses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = () => {
    window.open('/api/backup/export', '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await api.importBackup(json);
        if (res.success) {
          setImportStatus('Zaxira nusxa muvaffaqiyatli import qilindi va ma\'lumotlar bazasi qayta tiklandi!');
          await loadData();
        }
      } catch (err: any) {
        alert('Fayl yaroqsiz yoki noto\'g\'ri format: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <HardDriveDownload className="w-6 h-6 text-emerald-600" />
          <span>Ma'lumotlarni Rezerv Nusxalash va Arxivlash</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          TTZ 4.2.19 (Резерв нусхалаш ва қайта тиклаш) va 4.2.20 (Маълумотларни архивлаш)
        </p>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Export Backup Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Tizim Ma'lumotlarini Zaxiralash (Backup)</h2>
            <p className="text-slate-600 leading-relaxed">
              Barcha faol va arxivdagi manzillar, C-01 arizalar, audit loglar, foydalanuvchilar va sozlamalarni to'liq JSON zaxira fayli sifatida yuklab oling.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>To'liq Zaxira Nusxasini Yuklab Olish</span>
          </button>
        </div>

        {/* Import Restore Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Zaxira Nusxasidan Qayta Tiklash (Restore)</h2>
            <p className="text-slate-600 leading-relaxed">
              Favqulodda vaziyatlarda yoki yangi serverga ko'chirilganda, oldin eksport qilingan JSON faylni yuklab, tizim holatini darhol tiklashingiz mumkin.
            </p>
          </div>

          <div>
            <label className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Zaxira Faylini Tanlash va Tiklash</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Archive Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-slate-800 flex items-center space-x-2">
            <Archive className="w-4 h-4 text-slate-500" />
            <span>Arxivdagi Manzillar va O'zgarishlar Tarixi ({archivedAddresses.length} ta)</span>
          </div>
          <span className="text-[11px] text-slate-500">Doimiy saqlanadigan arxiv ma'lumotlari</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Geokod</th>
                <th className="py-3 px-4">Kadastr raqami</th>
                <th className="py-3 px-4">Manzil</th>
                <th className="py-3 px-4">O'chirilish sababi va Asos</th>
                <th className="py-3 px-4">Arxivlangan sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archivedAddresses.map(addr => (
                <tr key={addr.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-rose-800">{addr.geocode}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{addr.cadastreNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{addr.fullAddressUz}</td>
                  <td className="py-3 px-4 text-rose-700">
                    <div>{addr.statusReason || 'Bekor qilingan'}</div>
                    <div className="text-[10px] text-slate-400">{addr.legalGrounds}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(addr.updatedAt).toLocaleDateString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
