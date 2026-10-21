import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UzkadWebhookEventC03, Address } from '../types';
import {
  Cpu,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building,
  RefreshCw
} from 'lucide-react';

export const UzkadSimulatorPage: React.FC = () => {
  const [events, setEvents] = useState<UzkadWebhookEventC03[]>([]);
  const [activeAddresses, setActiveAddresses] = useState<Address[]>([]);
  const [cadastreNumber, setCadastreNumber] = useState('');
  const [deletionType, setDeletionType] = useState('DEMOLISHED');
  const [documentBasis, setDocumentBasis] = useState('Toshkent shahar hokimiyati buzish dalolatnomasi № 412/26');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await api.getUzkadEvents();
      if (res.success) setEvents(res.events);

      const addrRes = await api.getAddresses({ status: 'active' });
      if (addrRes.success) {
        setActiveAddresses(addrRes.addresses);
        if (addrRes.addresses.length > 0 && !cadastreNumber) {
          setCadastreNumber(addrRes.addresses[0].cadastreNumber);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.triggerUzkadWebhook({
        cadastreNumber,
        objectDeletionType: deletionType,
        documentBasis,
      });

      if (res.success) {
        setStatusMessage(res.message);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              C-03: UZKAD Tizimidan Avtomatik O'chirish Shlyuzi
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              TTZ 4.1.1.3 (C-03) va 4-rasm: Ko'chmas mulk buzilganda yoki o'chirilganda avtomatik qayta ishlash (&lt; 5 minut)
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Control & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Simulator Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>UZKAD Webhook xabarnomasini yuborish (Test):</span>
          </h2>

          <form onSubmit={handleTriggerWebhook} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ko'chmas mulk kadastr raqami:
              </label>
              <select
                value={cadastreNumber}
                onChange={e => setCadastreNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
              >
                {activeAddresses.map(a => (
                  <option key={a.id} value={a.cadastreNumber}>
                    {a.cadastreNumber} - {a.fullAddressUz.substring(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Obyekt o'chirilish sababi / turi:
              </label>
              <select
                value={deletionType}
                onChange={e => setDeletionType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="DEMOLISHED">Buzilgan (снос / rekonstruktsiya)</option>
                <option value="MERGED">Boshqa mulkka birlashtirilgan</option>
                <option value="SUBDIVIDED">Bo'lingan / taqsimlangan</option>
                <option value="COURT_DECISION">Sud qarori asosida bekor qilingan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Asos bo'lgan hujjat (Elektron reestr dalolatnomasi):
              </label>
              <input
                type="text"
                value={documentBasis}
                onChange={e => setDocumentBasis(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Yuborilmoqda...' : 'UZKAD Webhook xabarini yuborish'}</span>
            </button>
          </form>

          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <span className="font-bold">Muvaffaqiyatli:</span>
                <p>{statusMessage}</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
            <span className="font-bold text-slate-800 block">TTZ Reglament talabi:</span>
            <p>
              • UZKAD tizimidan ko'chmas mulk buzilganligi to'g'risida elektron xabarnoma kelgan zahoti 5 daqiqa ichida manzil avtomatik tarzda bekor qilinadi va arxiv bazasiga o'tkaziladi.
            </p>
          </div>
        </div>

        {/* Live Received Webhook Events Log (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Qabul qilingan UZKAD xabarnomalari jurnali ({events.length} ta):</span>
            </h2>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Yangilash"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {events.map(evt => (
              <div
                key={evt.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:bg-white transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-800 text-xs">{evt.eventId}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    AVTOMATIK QAYTA ISHLANDI
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Kadastr raqami:</span>
                    <span className="font-mono font-bold text-slate-800">{evt.cadastreNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">O'chirilish sababi:</span>
                    <span className="font-bold text-rose-700">{evt.objectDeletionType}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600">
                  <span>Hujjat asosi: </span>
                  <strong className="text-slate-800">{evt.documentBasis}</strong>
                </div>

                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-[11px] text-emerald-900">
                  {evt.actionTaken}
                </div>

                <div className="text-[10px] text-slate-400 font-mono text-right">
                  Qabul qilindi: {new Date(evt.notifiedAt).toLocaleString('uz-UZ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
