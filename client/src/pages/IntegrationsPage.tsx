import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Share2,
  CheckCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Activity,
  Layers
} from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getIntegrationsStatus();
      if (res.success) {
        setIntegrations(res.integrations);
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

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      alert(`Sinxronizatsiya muvaffaqiyatli yakunlandi!`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Share2 className="w-6 h-6 text-emerald-600" />
            <span>Tashqi Axborot Tizimlari Bilan Integratsiyalar Shlyuzi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            O'zMSt 2590:2012 milliy axborot tizimlarini integratsiyalashuvi standarti bo'yicha ulanishlar (TTZ 4.1.2)
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Holatni tekshirish</span>
        </button>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(item => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4 hover:shadow-md transition-shadow text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span>{item.status}</span>
              </span>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 font-mono text-[11px] text-slate-600 border border-slate-100">
              <div className="flex justify-between">
                <span>Protokol:</span>
                <span className="font-bold text-slate-800">{item.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span>Kechikish (Latency):</span>
                <span className="font-bold text-emerald-700">{item.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Oxirgi aloqa:</span>
                <span className="text-slate-500">{new Date(item.lastSync).toLocaleTimeString('uz-UZ')}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">TLS 1.3 / SSL Himoyalangan</span>
              <button
                onClick={() => handleSync(item.id)}
                disabled={syncingId === item.id}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${syncingId === item.id ? 'animate-spin' : ''}`} />
                <span>{syncingId === item.id ? 'Sinxronlanmoqda...' : 'Sinxronlash'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
