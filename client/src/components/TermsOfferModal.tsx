import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

export const TermsOfferModal: React.FC = () => {
  const { user, acceptTerms } = useAuth();

  if (!user || user.termsAccepted) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl p-6 sm:p-8 space-y-4 text-xs border border-slate-200">
        <div className="flex items-center space-x-3 text-emerald-700">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Ommaviy Oferta va Shaxsiy Ma'lumotlar Roziligi
            </h2>
            <p className="text-[11px] text-slate-500">TTZ 4.2.2 bandi bo'yicha majburiy talab</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-60 overflow-y-auto space-y-2 text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">
            "Ko'chmas mulk obyektlari manzillari reestri axborot tizimidan foydalanish to'g'risida"
          </p>
          <p>
            Ushbu tizim O'zbekiston Respublikasi Iqtisodiyot va moliya vazirligi huzuridagi Kadastr agentligi tomonidan yuritiladi. Vazirlar Mahkamasining 2018 yil 14 dekabrdagi 1010-son qarori va davlat standartlariga binoan, ko'chmas mulk obyektlariga unikal geokodlar va rasmiy manzillar berish uchun mo'ljallangan.
          </p>
          <p>
            1. Foydalanuvchi tizim orqali taqdim etiladigan rasmiy reestr ma'lumotlaridan qonuniy maqsadlarda foydalanish majburiyatini oladi.
          </p>
          <p>
            2. "Shaxsiy ma'lumotlar to'g'risida"gi O'zbekiston Respublikasi Qonuniga muvofiq, foydalanuvchi o'ziga tegishli JSHSHIR va kadastr ma'lumotlaridan tizim doirasida foydalanishga to'liq rozilik bildiradi.
          </p>
          <p>
            3. Tizimdagi har bir xatti-harakat va qidiruvlar O'zMSt 1987:2018 standarti bo'yicha audit jurnalida xavfsizlik maqsadida qayd etiladi.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={acceptTerms}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ommaviy oferta shartlarini qabul qilaman</span>
          </button>
        </div>
      </div>
    </div>
  );
};
