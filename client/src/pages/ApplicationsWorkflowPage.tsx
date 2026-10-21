import React, { useState, useEffect } from 'react';
import { ApplicationC01, ApplicationStage, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Send,
  Building,
  CreditCard,
  User,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  FileCheck,
  ChevronDown
} from 'lucide-react';

interface ApplicationsWorkflowPageProps {
  onOpenCertificate?: (addrId: string) => void;
  category?: 'all' | 'new_address' | 'change_address';
  initialStatusFilter?: 'all' | 'new' | 'in_progress' | 'completed' | 'rejected';
  onNavigateNew?: () => void;
}

export const ApplicationsWorkflowPage: React.FC<ApplicationsWorkflowPageProps> = ({
  onOpenCertificate,
  category = 'all',
  initialStatusFilter = 'all',
  onNavigateNew,
}) => {
  const { user, role } = useAuth();
  const [applications, setApplications] = useState<ApplicationC01[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationC01 | null>(null);
  const [activeStageFilter, setActiveStageFilter] = useState<string>(initialStatusFilter);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    setActiveStageFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications();
      if (res.success) {
        let filtered = res.applications;

        // Status filter:
        if (activeStageFilter === 'new') {
          filtered = filtered.filter(a => a.stage === 'FILIAL_REVIEW');
        } else if (activeStageFilter === 'in_progress') {
          filtered = filtered.filter(a => a.stage !== 'FILIAL_REVIEW' && a.stage !== 'APPROVED' && a.stage !== 'REJECTED');
        } else if (activeStageFilter === 'completed') {
          filtered = filtered.filter(a => a.stage === 'APPROVED');
        } else if (activeStageFilter === 'rejected') {
          filtered = filtered.filter(a => a.stage === 'REJECTED');
        }

        setApplications(filtered);
        if (selectedApp) {
          const updated = filtered.find(a => a.id === selectedApp.id);
          if (updated) setSelectedApp(updated);
          else if (filtered.length > 0) setSelectedApp(filtered[0]);
        } else if (filtered.length > 0) {
          setSelectedApp(filtered[0]);
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
  }, [activeStageFilter]);

  // Stage 1 Action: Filial DKP MM
  const handleFilialReview = async (appId: string) => {
    setActionInProgress(true);
    try {
      await api.filialReviewApplication(appId, {
        actorName: user?.fullName,
        actorRole: user?.role,
        comment: commentText || 'Kirish nuqtalari tekshirildi, avtomatik manzil berish moduli orqali geokod tayinlandi',
      });
      setCommentText('');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    } finally {
      setActionInProgress(false);
    }
  };

  // Stage 2 Action: Filial Rahbari DKP
  const handleFilialHeadAction = async (appId: string, action: 'approve' | 'return' | 'reject') => {
    setActionInProgress(true);
    try {
      await api.filialHeadActionApplication(appId, {
        action,
        actorName: user?.fullName,
        comment: commentText || (action === 'approve' ? 'Geokod va manzil ma\'lumotlari tasdiqlandi' : 'Kamchiliklar mavjud'),
      });
      setCommentText('');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    } finally {
      setActionInProgress(false);
    }
  };

  // Stage 3 Action: Hudud DKP MM
  const handleRegionAgreement = async (appId: string, action: 'agree' | 'return') => {
    setActionInProgress(true);
    try {
      await api.regionAgreementApplication(appId, {
        action,
        actorName: user?.fullName,
        comment: commentText || 'Hududiy boshqarma tomonidan bog\'lovchi yo\'lak kelishildi',
      });
      setCommentText('');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    } finally {
      setActionInProgress(false);
    }
  };

  // Stage 4 Action: Respublika DKP MM
  const handleRepublicApproval = async (appId: string, action: 'approve' | 'return') => {
    setActionInProgress(true);
    try {
      await api.republicApprovalApplication(appId, {
        action,
        actorName: user?.fullName,
        comment: commentText || 'Respublika apparati tomonidan tasdiqlandi',
      });
      setCommentText('');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    } finally {
      setActionInProgress(false);
    }
  };

  // Stage 5 Action: Pay invoice
  const handlePayInvoice = async (appId: string) => {
    setActionInProgress(true);
    try {
      await api.payInvoice(appId);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'To\'lov amalga oshmadi');
    } finally {
      setActionInProgress(false);
    }
  };

  const getStageBadge = (stage: ApplicationStage) => {
    switch (stage) {
      case 'FILIAL_REVIEW':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[10px]">1. Filial MM ko'rib chiqishi</span>;
      case 'FILIAL_HEAD_REVIEW':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold text-[10px]">2. Filial rahbari tasdig'i</span>;
      case 'REGION_AGREEMENT':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold text-[10px]">3. Hudud MM kelishuvi</span>;
      case 'REPUBLIC_APPROVAL':
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-bold text-[10px]">4. Respublika MM tasdig'i</span>;
      case 'PAYMENT_PENDING':
        return <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-bold text-[10px]">5. To'lov kutilmoqda</span>;
      case 'APPROVED':
        return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-bold text-[10px]">6. Tasdiqlangan / Reestrda</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full font-bold text-[10px]">Rad etilgan</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <GitBranch className="w-6 h-6 text-blue-600" />
              <span>
                {category === 'change_address'
                  ? "Joriy Manzillarni O'zgartirish"
                  : category === 'new_address'
                  ? "Yangi Manzil Yaratish"
                  : "Manzil Yaratish va O'zgartirish Arizalari"}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {category === 'change_address'
                ? "Mavjud ko'chmas mulk manzillarini o'zgartirish, qayta nomlash va reglament arizalari"
                : "Yangi ko'chmas mulk obyektlariga manzil shakllantirish, geokodlash va ro'yxatga olish jarayoni"}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onNavigateNew && (
              <button
                type="button"
                onClick={onNavigateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-2 shadow-sm transition-all"
              >
                <span>+ Yangi ariza kiritish</span>
              </button>
            )}

            {/* Status Pills */}
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
                  onClick={() => setActiveStageFilter(stg.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeStageFilter === stg.id
                      ? 'bg-white text-blue-600 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {stg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Application List + Detail & Approval Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applications List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            Arizalar ro'yxati ({applications.length} ta)
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {applications.map(app => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {app.applicationNumber}
                    </span>
                    {getStageBadge(app.stage)}
                  </div>

                  <p className="font-semibold text-xs text-slate-800 line-clamp-1">
                    {app.region}, {app.district}, {app.streetName}, {app.houseNumber}-uy
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Kadastr: <strong className="font-mono text-slate-700">{app.cadastreNumber}</strong></span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-[10px]">
                      {app.source}
                    </span>
                  </div>

                  {app.connectingLine && (
                    <div className="mt-1 text-[10px] text-purple-700 font-medium">
                      Bog'lovchi chiziq: {app.connectingLine.lengthMeters}m (Hudud & Respublika kelishuvi talab etiladi)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Application Detail & Actions (7 cols) */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 text-xs">
              {/* App Title & Stage */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900 text-lg font-mono">
                      {selectedApp.applicationNumber}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                      Manba: {selectedApp.source}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Yaratilgan: {new Date(selectedApp.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
                {getStageBadge(selectedApp.stage)}
              </div>

              {/* Applicant & Property Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ariza beruvchi:</span>
                  </div>
                  <p className="font-semibold text-slate-900">{selectedApp.applicantName}</p>
                  <p className="text-slate-500 font-mono text-[11px]">JSHSHIR/STIR: {selectedApp.applicantPinflOrStir}</p>
                  <p className="text-slate-500 font-mono text-[11px]">Tel: {selectedApp.applicantPhone}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ko'chmas mulk obyekti:</span>
                  </div>
                  <p className="font-mono font-bold text-emerald-800">{selectedApp.cadastreNumber}</p>
                  <p className="text-slate-700 font-medium">
                    {selectedApp.region}, {selectedApp.district}
                  </p>
                  <p className="text-slate-500">Turi: <strong className="capitalize">{selectedApp.objectType}</strong></p>
                </div>
              </div>

              {/* Address Elements Card */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  Biriktirilayotgan rasmiy manzil:
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedApp.region}, {selectedApp.district}, {selectedApp.planningStructureName || ''}, {selectedApp.streetName}, {selectedApp.houseNumber}-uy
                  {selectedApp.blockNumber ? `, ${selectedApp.blockNumber}-bino` : ''}
                  {selectedApp.unitNumber ? `, ${selectedApp.unitNumber}-xonadon` : ''}
                </p>
                <div className="text-[11px] text-slate-600 flex items-center space-x-4 pt-1 font-mono">
                  <span>Pochta: {selectedApp.postalCode}</span>
                  {selectedApp.assignedGeocode && (
                    <span className="text-emerald-700 font-bold">
                      Geokod: {selectedApp.assignedGeocode}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting line notice */}
              {selectedApp.connectingLine && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 flex items-start space-x-2">
                  <div className="font-bold">Bog'lovchi chiziq (yo'lak):</div>
                  <div>
                    {selectedApp.connectingLine.lengthMeters} metr (TTZ 4.2.11 ga mos).
                    Ushbu arizani tasdiqlash uchun Viloyat va Respublika DKP MM kelishuvi shart!
                  </div>
                </div>
              )}

              {/* Action Buttons for Roles (The Swimlane Approval Bar) */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center space-x-1.5 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Ijro va Tasdiqlash harakatlari (Rolingiz: {role})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">TTZ C-01 Reglamenti</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Qaror izohi yoki ko'rsatmasini kiriting (ixtiyoriy)..."
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  {/* Actions by Stage and Role */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Stage 1: Filial DKP MM */}
                    {selectedApp.stage === 'FILIAL_REVIEW' && (
                      <button
                        onClick={() => handleFilialReview(selectedApp.id)}
                        disabled={actionInProgress}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirish nuqtalarini tasdiqlash va Rahbarga yuborish (Filial MM)</span>
                      </button>
                    )}

                    {/* Stage 2: Filial Rahbari DKP */}
                    {selectedApp.stage === 'FILIAL_HEAD_REVIEW' && (
                      <>
                        <button
                          onClick={() => handleFilialHeadAction(selectedApp.id, 'approve')}
                          disabled={actionInProgress}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-md"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Geokod biriktirish va Tasdiqlash (Filial Rahbari)</span>
                        </button>
                        <button
                          onClick={() => handleFilialHeadAction(selectedApp.id, 'return')}
                          disabled={actionInProgress}
                          className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-3 py-2 rounded-lg flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Ijrochiga qaytarish</span>
                        </button>
                        <button
                          onClick={() => handleFilialHeadAction(selectedApp.id, 'reject')}
                          disabled={actionInProgress}
                          className="bg-rose-700 hover:bg-rose-600 text-white font-medium px-3 py-2 rounded-lg flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rad etish</span>
                        </button>
                      </>
                    )}

                    {/* Stage 3: Hudud DKP MM */}
                    {selectedApp.stage === 'REGION_AGREEMENT' && (
                      <>
                        <button
                          onClick={() => handleRegionAgreement(selectedApp.id, 'agree')}
                          disabled={actionInProgress}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-md"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Bog'lovchi chiziqni kelishish (Hudud DKP MM)</span>
                        </button>
                        <button
                          onClick={() => handleRegionAgreement(selectedApp.id, 'return')}
                          disabled={actionInProgress}
                          className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-3 py-2 rounded-lg flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Ijrochiga qaytarish</span>
                        </button>
                      </>
                    )}

                    {/* Stage 4: Respublika DKP MM */}
                    {selectedApp.stage === 'REPUBLIC_APPROVAL' && (
                      <>
                        <button
                          onClick={() => handleRepublicApproval(selectedApp.id, 'approve')}
                          disabled={actionInProgress}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-md"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Respublika darajasida yakuniy tasdiqlash (Respublika DKP MM)</span>
                        </button>
                        <button
                          onClick={() => handleRepublicApproval(selectedApp.id, 'return')}
                          disabled={actionInProgress}
                          className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-3 py-2 rounded-lg flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Ijrochiga qaytarish</span>
                        </button>
                      </>
                    )}

                    {/* Stage 5: Invoys to'lovi */}
                    {selectedApp.stage === 'PAYMENT_PENDING' && (
                      <button
                        onClick={() => handlePayInvoice(selectedApp.id)}
                        disabled={actionInProgress}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-md"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Invoys to'lovini simulyatsiya qilish ({selectedApp.invoiceAmountUzs} so'm)</span>
                      </button>
                    )}

                    {/* Completed Stage */}
                    {selectedApp.stage === 'APPROVED' && (
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Manzil tasdiqlangan va Yagona Reestrga kiritilgan!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Audit History */}
              <div>
                <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ariza ijrosi tarixi va audit yo'li (Timeline):</span>
                </h3>

                <div className="border-l-2 border-emerald-500 pl-4 space-y-3">
                  {selectedApp.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white"></div>
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
              Ariza tafsilotlarini ko'rish uchun chap ro'yxatdan tanlang.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
