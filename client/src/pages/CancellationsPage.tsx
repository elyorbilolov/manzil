import React, { useState, useEffect } from 'react';
import { CancellationRequestC02, Address } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Trash2,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
  Building,
  PlusCircle,
  Send
} from 'lucide-react';

interface CancellationsPageProps {
  initialStatusFilter?: 'all' | 'new' | 'in_progress' | 'completed' | 'rejected';
}

export const CancellationsPage: React.FC<CancellationsPageProps> = ({
  initialStatusFilter = 'all',
}) => {
  const { user, role } = useAuth();
  const [cancellations, setCancellations] = useState<CancellationRequestC02[]>([]);
  const [selectedCan, setSelectedCan] = useState<CancellationRequestC02 | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'completed' | 'rejected'>(initialStatusFilter);
  const [showNewModal, setShowNewModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  // New cancellation form
  const [targetAddressId, setTargetAddressId] = useState('');
  const [reason, setReason] = useState('Obyekt buzilgan va qayta qurilish rejalashtirilgan');
  const [legalDocNumber, setLegalDocNumber] = useState('Q-2026/112');
  const [legalDocDate, setLegalDocDate] = useState('2026-02-18');
  const [availableAddresses, setAvailableAddresses] = useState<Address[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getCancellations();
      if (res.success) {
        let filtered = res.cancellations;

        if (statusFilter === 'new') {
          filtered = filtered.filter(c => c.stage === 'FILIAL_SUBMITTED');
        } else if (statusFilter === 'in_progress') {
          filtered = filtered.filter(c => c.stage === 'FILIAL_HEAD_REVIEW' || c.stage === 'REGION_AGREEMENT' || c.stage === 'REPUBLIC_APPROVAL');
        } else if (statusFilter === 'completed') {
          filtered = filtered.filter(c => c.stage === 'COMPLETED');
        } else if (statusFilter === 'rejected') {
          filtered = filtered.filter(c => c.stage === 'REJECTED');
        }

        setCancellations(filtered);
        if (selectedCan) {
          const updated = filtered.find(c => c.id === selectedCan.id);
          if (updated) setSelectedCan(updated);
          else if (filtered.length > 0) setSelectedCan(filtered[0]);
        } else if (filtered.length > 0) {
          setSelectedCan(filtered[0]);
        }
      }
      const addrRes = await api.getAddresses({ status: 'active' });
      if (addrRes.success) {
        setAvailableAddresses(addrRes.addresses);
        if (addrRes.addresses.length > 0 && !targetAddressId) {
          setTargetAddressId(addrRes.addresses[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreateCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCancellation({
        addressId: targetAddressId,
        reason,
        legalDocumentNumber: legalDocNumber,
        legalDocumentDate: legalDocDate,
        actorName: user?.fullName,
      });
      if (res.success) {
        setShowNewModal(false);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  const handleFilialHeadAction = async (id: string, action: 'forward' | 'reject') => {
    try {
      await api.filialHeadCancellationAction(id, {
        action,
        comment: commentText,
        actorName: user?.fullName,
      });
      setCommentText('');
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRegionAgreement = async (id: string, action: 'agree' | 'reject') => {
    try {
      await api.regionCancellationAgreement(id, {
        action,
        comment: commentText,
        actorName: user?.fullName,
      });
      setCommentText('');
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRepublicApproval = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.republicCancellationApproval(id, {
        action,
        comment: commentText,
        actorName: user?.fullName,
      });
      setCommentText('');
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Trash2 className="w-6 h-6 text-rose-600" />
            <span>Manzillarni O'chirish (C-02 Reglamenti)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ko'chmas mulk buzilishi yoki qayta rejalashtirish asosi bo'yicha manzillarni bekor qilish va arxivlash
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status filter pills */}
          <div className="flex flex-wrap gap-1 text-xs bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'new', label: 'Yangi arizalar' },
              { id: 'in_progress', label: 'Jarayonda' },
              { id: 'completed', label: 'Yakunlangan' },
              { id: 'rejected', label: 'Rad etilgan' },
            ].map(stg => (
              <button
                key={stg.id}
                onClick={() => setStatusFilter(stg.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === stg.id
                    ? 'bg-white text-rose-600 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {stg.label}
              </button>
            ))}
          </div>

          {role !== 'CITIZEN' && (
            <button
              onClick={() => setShowNewModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>O'chirish taklifini kiritish</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: List + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            O'chirish so'rovlari ({cancellations.length} ta)
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {cancellations.map(can => {
              const isSelected = selectedCan?.id === can.id;
              return (
                <div
                  key={can.id}
                  onClick={() => setSelectedCan(can)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{can.requestNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      {can.stage}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 font-mono text-emerald-800">{can.geocode}</p>
                  <p className="text-xs text-slate-700 line-clamp-1 mt-0.5">{can.fullAddress}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    Asos: <span className="font-medium text-slate-800">{can.legalDocumentNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-7">
          {selectedCan ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-mono">{selectedCan.requestNumber}</h2>
                  <p className="text-slate-500 text-[11px]">
                    Sana: {new Date(selectedCan.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full font-bold bg-rose-100 text-rose-800 text-xs">
                  {selectedCan.stage}
                </span>
              </div>

              {/* Address info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">O'chirilishi so'ralayotgan manzil:</div>
                <p className="text-sm font-bold text-slate-900">{selectedCan.fullAddress}</p>
                <div className="flex gap-4 font-mono text-[11px] text-slate-600">
                  <span>Geokod: <strong className="text-emerald-700">{selectedCan.geocode}</strong></span>
                  <span>Kadastr: <strong>{selectedCan.cadastreNumber}</strong></span>
                </div>
              </div>

              {/* Legal grounds */}
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1 text-rose-900">
                <span className="font-bold block">O'chirish sababi va huquqiy asosi:</span>
                <p className="text-xs font-medium">{selectedCan.reason}</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Hujjat № <strong>{selectedCan.legalDocumentNumber}</strong> (Sanasi: {selectedCan.legalDocumentDate})
                </p>
              </div>

              {/* Actions based on stage */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="font-bold text-xs text-rose-400">
                  C-02 Bosqichli tasdiqlash harakati:
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Qaror izohini yozing..."
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedCan.stage === 'FILIAL_SUBMITTED' && (
                    <button
                      onClick={() => handleFilialHeadAction(selectedCan.id, 'forward')}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Viloyat DKP MM ga yuborish (Filial Rahbari)</span>
                    </button>
                  )}

                  {selectedCan.stage === 'REGION_AGREEMENT' && (
                    <button
                      onClick={() => handleRegionAgreement(selectedCan.id, 'agree')}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Kelishish va Respublika DKP MM ga yuborish (Hudud MM)</span>
                    </button>
                  )}

                  {selectedCan.stage === 'REPUBLIC_APPROVAL' && (
                    <button
                      onClick={() => handleRepublicApproval(selectedCan.id, 'approve')}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1 shadow-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yakuniy tasdiqlash va Reestrdan o'chirish (Respublika DKP MM)</span>
                    </button>
                  )}

                  {selectedCan.stage === 'COMPLETED' && (
                    <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Manzil reestrdan muvaffaqiyatli o'chirildi va arxivlandi!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>O'chirish so'rovi tarixi (Timeline):</span>
                </h3>
                <div className="border-l-2 border-rose-500 pl-4 space-y-3">
                  {selectedCan.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-600 border border-white"></div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{item.actorName}</span>
                        <span className="text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.actorRole}</div>
                      <p className="text-xs text-slate-700 mt-0.5">{item.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-400">
              So'rov tafsilotlarini ko'rish uchun chap ro'yxatdan tanlang.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Cancellation Request */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>Manzilni o'chirish taklifini kiritish (C-02)</span>
            </h2>

            <form onSubmit={handleCreateCancellation} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">O'chiriladigan faol manzil:</label>
                <select
                  value={targetAddressId}
                  onChange={e => setTargetAddressId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {availableAddresses.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.geocode} - {a.fullAddressUz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">O'chirish sababi:</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asos hujjat raqami:</label>
                  <input
                    type="text"
                    value={legalDocNumber}
                    onChange={e => setLegalDocNumber(e.target.value)}
                    placeholder="Q-2026/84"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hujjat sanasi:</label>
                  <input
                    type="date"
                    value={legalDocDate}
                    onChange={e => setLegalDocDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Taklifni kiritish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
