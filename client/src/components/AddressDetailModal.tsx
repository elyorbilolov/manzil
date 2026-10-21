import React from 'react';
import { Address } from '../types';
import { GISMap } from './GISMap';
import {
  X,
  Award,
  MapPin,
  Building,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ExternalLink,
  Layers,
  FileText
} from 'lucide-react';

interface AddressDetailModalProps {
  address: Address;
  onClose: () => void;
  onOpenCertificate: (id: string) => void;
}

export const AddressDetailModal: React.FC<AddressDetailModalProps> = ({
  address,
  onClose,
  onOpenCertificate,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8 text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-mono font-bold text-sm tracking-wide text-emerald-400">
                {address.geocode}
              </span>
              <span className="text-[11px] text-slate-400 ml-2">
                (Kadastr: {address.cadastreNumber})
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenCertificate(address.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Award className="w-4 h-4" />
              <span>Rasmiy Ma'lumotnoma (QR)</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Full Address Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Rasmiy Manzil Matnlari (3 ta tilda - TTZ 4.1.7):
            </span>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-sm">
                O'zbek (lotin): <span className="font-normal">{address.fullAddressUz}</span>
              </p>
              <p className="font-medium text-slate-700 text-xs">
                Ўзбек (кирилл): <span className="italic">{address.fullAddressUzCyrillic}</span>
              </p>
              <p className="font-medium text-slate-700 text-xs">
                Русский: <span className="italic">{address.fullAddressRu}</span>
              </p>
            </div>
          </div>

          {/* Grid: Elements & GIS Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Elements Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-800 text-xs mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Manzilni shakllantiruvchi elementlar:</span>
              </div>
              <div className="space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex justify-between border-b pb-1">
                  <span>Hudud / Viloyat:</span>
                  <span className="font-bold text-slate-800">{address.region}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Tuman / Shahar:</span>
                  <span className="font-bold text-slate-800">{address.district}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Pochta indeksi:</span>
                  <span className="font-mono font-bold text-slate-800">{address.postalCode}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Rejalashtirish tuzilmasi:</span>
                  <span className="font-semibold text-slate-800">{address.planningStructureName || '-'}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Yo'l tarmog'i va Ko'cha:</span>
                  <span className="font-bold text-slate-800">{address.streetName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Uy raqami:</span>
                  <span className="font-bold text-slate-800">{address.houseNumber} {address.blockNumber ? `(${address.blockNumber}-korpus)` : ''}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Obyekt turi:</span>
                  <span className="capitalize font-semibold text-slate-800">{address.objectType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Huquqiy asosi:</span>
                  <span className="text-slate-800">{address.legalGrounds || 'VM 1010-son qarori'}</span>
                </div>
              </div>
            </div>

            {/* GIS Location and Mini-Map */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xaritadagi joylashuvi (WGS-84):</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {address.lat.toFixed(5)}, {address.lng.toFixed(5)}
                </span>
              </div>

              <div className="h-56 rounded-xl overflow-hidden border border-slate-200">
                <GISMap
                  addresses={[address]}
                  selectedAddress={address}
                  height="224px"
                  center={[address.lat, address.lng]}
                  zoom={16}
                />
              </div>
            </div>
          </div>

          {/* Entrance points & Connecting Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 text-xs">
                Kirish va asosiy kirish nuqtalari ({address.entrancePoints?.length || 0} ta):
              </div>
              {address.entrancePoints?.map((ep, idx) => (
                <div key={ep.id} className="flex justify-between font-mono text-[11px] text-slate-600">
                  <span>{idx + 1}. {ep.name || 'Kirish eshigi'} ({ep.type}):</span>
                  <span>{ep.lat.toFixed(5)}, {ep.lng.toFixed(5)}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 text-xs">Bog'lovchi chiziq (yo'lak):</div>
              {address.connectingLine ? (
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between font-bold text-purple-800">
                    <span>Uzunligi:</span>
                    <span>{address.connectingLine.lengthMeters} metr (&lt;50m)</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Ulangan ko'cha: {address.connectingLine.targetStreetName || address.streetName}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic">Bog'lovchi chiziq mavjud emas (ko'chaga bevosita tutash)</p>
              )}
            </div>
          </div>

          {/* History Timeline */}
          {address.history && address.history.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>O'zgarishlar va Audit Tarixi:</span>
              </h3>
              <div className="border-l-2 border-slate-200 pl-4 space-y-2 text-slate-600 text-[11px]">
                {address.history.map((h, i) => (
                  <div key={i}>
                    <div className="flex items-center space-x-2 font-bold text-slate-800">
                      <span>{h.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({new Date(h.timestamp).toLocaleString('uz-UZ')})</span>
                    </div>
                    <p className="text-slate-500">{h.details} — <strong className="text-slate-700">{h.changedBy}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
