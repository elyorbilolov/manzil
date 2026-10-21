import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditLog, AuditLogCategory } from '../types';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  FileSpreadsheet
} from 'lucide-react';

const categoryLabels: Record<AuditLogCategory, { label: string; color: string }> = {
  AUTH: { label: 'Аутентификация (Кириш/Чиқиш)', color: 'bg-blue-100 text-blue-800' },
  AUTHORIZATION: { label: 'Авторизация (Рухсат/Рад)', color: 'bg-indigo-100 text-indigo-800' },
  USER_ACTION: { label: 'Фойдаланувчи амаллари', color: 'bg-emerald-100 text-emerald-800' },
  ADMIN_ACTION: { label: 'Маъмурий амаллар', color: 'bg-amber-100 text-amber-800' },
  SYSTEM: { label: 'Тизим ҳодисалари', color: 'bg-purple-100 text-purple-800' },
  DATA_OPERATION: { label: 'Маълумотлар операцияси', color: 'bg-cyan-100 text-cyan-800' },
  SECURITY: { label: 'Хавфсизлик ҳодисаси', color: 'bg-rose-100 text-rose-800' },
};

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        category: categoryFilter,
        status: statusFilter,
        query: searchQuery,
      });
      if (res.success) setLogs(res.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['Vaqt', 'Toifa', 'Harakat', 'Foydalanuvchi', 'Rol', 'IP_manzil', 'Tafsilot', 'Holat'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.userName}"`,
      `"${l.userRole || ''}"`,
      `"${l.ip}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ScrollText className="w-6 h-6 text-emerald-600" />
            <span>Tizimdagi Barcha Amallarni Qayd Etish (Audit Log)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            TTZ 4.2.18 talabi: 7 ta toifa bo'yicha hodisalarni to'liq audit qilish va xavfsizlik nazorati
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-2 shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Audit jurnalini eksport qilish</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Harakat, foydalanuvchi yoki tafsilot bo'yicha qidiruv..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2 rounded-xl"
          >
            Qidirish
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Audit Toifasi (TTZ 4.2.18):</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">Barcha 7 ta toifa</option>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Holati:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">Barcha holatlar</option>
              <option value="SUCCESS">Muvaffaqiyatli (SUCCESS)</option>
              <option value="WARNING">Ogohlantirish (WARNING)</option>
              <option value="ERROR">Xatolik (ERROR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Vaqt (Timestamp)</th>
                <th className="py-3 px-4">Hodisa Toifasi</th>
                <th className="py-3 px-4">Amal (Action)</th>
                <th className="py-3 px-4">Foydalanuvchi / IP</th>
                <th className="py-3 px-4">Tafsilotlar</th>
                <th className="py-3 px-4">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map(log => {
                const cat = categoryLabels[log.category] || { label: log.category, color: 'bg-slate-100' };
                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${cat.color}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.ip} {log.userRole ? `(${log.userRole})` : ''}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-sm">
                      {log.details}
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>OK</span>
                        </span>
                      ) : log.status === 'WARNING' ? (
                        <span className="text-amber-600 font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>OGOH</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>XATO</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
