import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, X, Lock, ExternalLink, CheckCircle } from 'lucide-react';

export const OneIdModal: React.FC = () => {
  const { showOneIdModal, setShowOneIdModal, loginOneID } = useAuth();
  const [pinfl, setPinfl] = useState('31201880010023');
  const [fullName, setFullName] = useState('Abdullayev Otabek Shavkatovich');
  const [loading, setLoading] = useState(false);

  if (!showOneIdModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await loginOneID(pinfl, fullName);
    setLoading(false);
  };

  const sampleStaff = [
    { pinfl: '31201880010023', name: 'Abdullayev Otabek Shavkatovich', role: 'ADMIN (Administrator)' },
    { pinfl: '32502930050011', name: 'Bo\'riyev Komiljon Ergashovich', role: 'FILIAL_DKP_MM (Tuman mutaxassisi)' },
    { pinfl: '32211900040089', name: 'Omonov Sarvar Davronovich', role: 'FILIAL_RAHBARI_DKP (Filial rahbari)' },
    { pinfl: '32009890030067', name: 'Turg\'unov Xurshidbek Anvarovich', role: 'HUDUD_DKP_MM (Viloyat)' },
    { pinfl: '31505850020045', name: 'Mirmaqsudov Mirkomil Bahodirovich', role: 'RESPUBLIKA_DKP_MM (Respublika)' },
    { pinfl: '30101950070055', name: 'Yo\'ldoshev Alisher Farhodovich', role: 'CITIZEN (Fuqaro)' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 text-xs">
        {/* Top OneID Branding */}
        <div className="bg-[#0052cc] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
              id
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide">id.egov.uz</h2>
              <p className="text-[10px] text-white/80">Yagona identifikatsiya tizimi (OneID)</p>
            </div>
          </div>
          <button
            onClick={() => setShowOneIdModal(false)}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Xavfsiz OAuth 2.0 / SSL identifikatsiya kanali (TTZ 4.1.2.1)</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                JSHSHIR (ПИНФЛ 14 xonali raqam):
              </label>
              <input
                type="text"
                value={pinfl}
                onChange={e => setPinfl(e.target.value)}
                maxLength={14}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">To'liq F.I.Sh:</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Identifikatsiya qilinmoqda...' : 'OneID orqali tasdiqlash'}</span>
            </button>
          </form>

          {/* Quick pick sample test identities */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Namunaviy xodim profilini tanlash:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {sampleStaff.map(s => (
                <button
                  key={s.pinfl}
                  type="button"
                  onClick={() => {
                    setPinfl(s.pinfl);
                    setFullName(s.name);
                  }}
                  className="w-full text-left p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-[11px]"
                >
                  <span className="truncate font-medium text-slate-800">{s.name}</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold ml-1">{s.role.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
