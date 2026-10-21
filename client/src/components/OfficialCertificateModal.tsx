import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Address, CertificateData } from '../types';
import { api } from '../services/api';
import { X, Printer, Download, CheckCircle, Shield, Award, MapPin } from 'lucide-react';

interface OfficialCertificateModalProps {
  addressId: string;
  onClose: () => void;
}

export const OfficialCertificateModal: React.FC<OfficialCertificateModalProps> = ({ addressId, onClose }) => {
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await api.getCertificate(addressId, 'Rasmiy so\'rov');
        if (res.success && res.certificate) {
          setCert(res.certificate);
          // Generate QR code Data URL
          const qr = await QRCode.toDataURL(res.certificate.qrPayload, {
            width: 140,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
          setQrDataUrl(qr);
        }
      } catch (err) {
        console.error('Failed to load certificate', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [addressId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-semibold text-slate-800 text-sm">Rasmiy ma'lumotnoma shakllantirilmoqda...</p>
        </div>
      </div>
    );
  }

  if (!cert) return null;

  const addr = cert.address;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Modal Controls Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">
              Rasmiy Ma'lumotnoma (Davlat andozasi)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Document (Printable) */}
        <div className="p-8 sm:p-12 bg-white text-slate-800 print:p-0 print:m-0" id="official-cert-doc">
          {/* Top Emblem & Header */}
          <div className="text-center pb-6 border-b-2 border-emerald-800/30 mb-6">
            <div className="w-16 h-16 mx-auto mb-2 bg-slate-100 rounded-full flex items-center justify-center border border-emerald-700/30">
              <Shield className="w-10 h-10 text-emerald-800" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider max-w-lg mx-auto">
              O'ZBEKISTON RESPUBLIKASI IQTISODIYOT VA MOLIYA VAZIRLIGI HUZURIDAGI KADASTR AGENTLIGI
            </h2>
            <h1 className="text-base font-black text-emerald-900 uppercase tracking-widest mt-3">
              KO'CHMAS MULK OB'EKTLARI MANZILLARI REESTRIDAN
            </h1>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              MA'LUMOTNOMA (KO'CHIRMA)
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              № {cert.certificateNumber} | Sana: {new Date(cert.issuedDate).toLocaleDateString('uz-UZ')}
            </p>
          </div>

          {/* Status Badge */}
          <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Unikal Geokod:</span>
              <span className="text-base font-mono font-bold text-emerald-800">{addr.geocode}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Kadastr raqami:</span>
              <span className="text-base font-mono font-bold text-slate-900">{addr.cadastreNumber}</span>
            </div>
          </div>

          {/* Main Address Elements Grid */}
          <div className="space-y-4 mb-8 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium block">Viloyat / Hudud:</span>
                <span className="font-bold text-slate-900 text-sm">{addr.region}</span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium block">Tuman / Shahar:</span>
                <span className="font-bold text-slate-900 text-sm">{addr.district}</span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium block">Mahalla / Mavze:</span>
                <span className="font-bold text-slate-900 text-sm">{addr.planningStructureName || 'Mavjud emas'}</span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium block">Pochta indeksi:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{addr.postalCode}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-emerald-800 font-semibold text-[11px] uppercase tracking-wide block mb-1">
                Rasmiy to'liq manzil matni:
              </span>
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {addr.fullAddressUz}
              </p>
              <p className="text-xs text-slate-600 mt-1 italic">
                {addr.fullAddressUzCyrillic}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Ko'cha nomi:</span>
                <span className="font-bold text-slate-900">{addr.streetName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Uy / Bino raqami:</span>
                <span className="font-bold text-slate-900">{addr.houseNumber} {addr.blockNumber ? `(${addr.blockNumber})` : ''}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Xonadon / Birlik:</span>
                <span className="font-bold text-slate-900">{addr.unitNumber || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Geofazoviy koordinatalari (WGS-84):</span>
                <span className="font-mono font-bold text-slate-800">
                  {addr.lat.toFixed(6)}, {addr.lng.toFixed(6)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Kirish nuqtalari soni:</span>
                <span className="font-bold text-slate-800">
                  {addr.entrancePoints?.length || 1} ta (Asosiy va ikkilamchi)
                </span>
              </div>
            </div>
          </div>

          {/* Verification & E-Signature Footer */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              {qrDataUrl && (
                <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-sm">
                  <img src={qrDataUrl} alt="QR Verification" className="w-24 h-24" />
                </div>
              )}
              <div className="text-[11px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-800">Haqiqiyligini tekshirish uchun QR-kodni skanerlang</p>
                <p>Havola: <span className="font-mono text-emerald-700">manzil.kadastr.uz</span></p>
                <p className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                  Hash: {cert.digitalSignatureHash}
                </p>
              </div>
            </div>

            {/* Official Seal / ERI stamp */}
            <div className="border-2 border-emerald-700 rounded-xl p-3 bg-emerald-50/50 text-emerald-900 text-center text-xs min-w-[200px] shadow-sm">
              <div className="font-black text-[11px] tracking-wider uppercase">ELEKTRON RAQAMLI IMZO</div>
              <div className="font-bold text-[10px] text-slate-700 mt-1">DAVLAT KADASTRALARI PALATASI</div>
              <div className="text-[10px] text-emerald-800 font-mono mt-1">Sertifikat: № 2026-DKP-9482</div>
              <div className="text-[9px] text-slate-500 mt-1">Vaqt: {new Date(cert.issuedDate).toLocaleString('uz-UZ')}</div>
              <div className="text-[9px] text-emerald-700 font-semibold mt-1">✓ TASDIQLANGAN</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
