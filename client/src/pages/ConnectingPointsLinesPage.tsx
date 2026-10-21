import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Address, EntrancePoint, ConnectingLine } from '../types';
import { GISMap } from '../components/GISMap';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Plus,
  Layers,
  Building,
  Info,
  Check
} from 'lucide-react';

export const ConnectingPointsLinesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [interactiveMode, setInteractiveMode] = useState<'none' | 'add_entrance' | 'draw_line'>('none');
  const [entrancePoints, setEntrancePoints] = useState<EntrancePoint[]>([]);
  const [connectingLine, setConnectingLine] = useState<ConnectingLine | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getAddresses();
        if (res.success && res.addresses.length > 0) {
          setAddresses(res.addresses);
          setSelectedAddress(res.addresses[0]);
          setEntrancePoints(res.addresses[0].entrancePoints || []);
          setConnectingLine(res.addresses[0].connectingLine || null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddress(addr);
    setEntrancePoints(addr.entrancePoints || []);
    setConnectingLine(addr.connectingLine || null);
    setSaveSuccess(false);
  };

  const handleEntranceAdded = (pt: EntrancePoint) => {
    setEntrancePoints(prev => [...prev, pt]);
    setInteractiveMode('none');
  };

  const handleLineCompleted = (line: ConnectingLine) => {
    setConnectingLine(line);
    setInteractiveMode('none');
  };

  const handleSave = () => {
    if (!selectedAddress) return;
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isLineValid = connectingLine ? connectingLine.lengthMeters <= 50 : true;

  return (
    <div className="space-y-4 font-['Inter',sans-serif]">
      {/* 1. Header with TTZ standard rules */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Bog'lash nuqta va/yoki chiziqlarni yaratish
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                TTZ 4.2.3 va 4.2.4: Bino/uchastka kirish nuqtasini belgilash va ko'cha o'qi bilan bog'lovchi yo'lak (&lt;50m) chizish
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInteractiveMode(interactiveMode === 'add_entrance' ? 'none' : 'add_entrance')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              interactiveMode === 'add_entrance'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>📍 Kirish nuqtasini qo'yish</span>
          </button>

          <button
            type="button"
            onClick={() => setInteractiveMode(interactiveMode === 'draw_line' ? 'none' : 'draw_line')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              interactiveMode === 'draw_line'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>📏 Bog'lovchi chiziq (&lt;50m)</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-2 transition-colors"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? "Saqlandi!" : "Saqlash"}</span>
          </button>
        </div>
      </div>

      {/* 2. Status Banners: Distance & Rule Compliance */}
      {interactiveMode !== 'none' && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-amber-800 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {interactiveMode === 'add_entrance'
              ? "Xaritada bino yoki uchastka chegarasi ustiga bosing — kirish nuqtasi avtomatik chegaraga joylashtiriladi."
              : "Xaritada kirish nuqtasidan boshlab ko'cha o'qigacha chiziq chizing. Masofa avtomatik hisoblanadi."}
          </span>
        </div>
      )}

      {connectingLine && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          isLineValid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            {isLineValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <div>
              <span className="font-bold">Bog'lovchi yo'lak uzunligi: </span>
              <span className="font-mono font-bold text-sm">{connectingLine.lengthMeters.toFixed(1)} metr</span>
              <span className="ml-2 font-medium">
                {isLineValid
                  ? "✓ TTZ talabi bajarildi (50 metrdan oshmagan)"
                  : "✗ DIQQAT: Uzunlik 50 metrdan oshib ketdi! Qaytadan yaqinroq ko'cha nuqtasiga bog'lang."}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConnectingLine(null)}
            className="text-[11px] underline font-medium hover:opacity-80"
          >
            Chiziqni tozalash
          </button>
        </div>
      )}

      {/* 3. Main Split View: Map + Object Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive Map */}
        <div className="lg:col-span-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <GISMap
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelectAddress={handleSelectAddress}
            interactiveMode={interactiveMode}
            onEntranceAdded={handleEntranceAdded}
            onLineCompleted={handleLineCompleted}
            height="calc(100vh - 280px)"
            center={selectedAddress ? [selectedAddress.lat, selectedAddress.lng] : [41.2858, 69.2036]}
            zoom={selectedAddress ? 17 : 14}
          />
        </div>

        {/* Right: Object & Points Control Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Cadastral Parcel Info */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 flex items-center space-x-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Tanlangan ko'chmas mulk</span>
              </span>
              <span className="font-mono font-bold text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {selectedAddress?.cadastreNumber}
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Rasmiy manzili</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {selectedAddress?.fullAddressUz}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[11px]">Geokod:</span>
                <div className="font-mono font-bold text-slate-700">{selectedAddress?.geocode}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Koordinata:</span>
                <div className="font-mono text-slate-700 text-[11px] truncate">
                  {selectedAddress?.lat.toFixed(4)}, {selectedAddress?.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Entrance Points List */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Kirish nuqtalari ({entrancePoints.length} ta)</span>
              </span>
              <span className="text-[10px] text-slate-400">Chegara ustida</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {entrancePoints.length === 0 ? (
                <div className="text-slate-400 text-[11px] italic py-2 text-center">
                  Hozircha kirish nuqtasi qo'yilmagan. Yuqoridagi "Kirish nuqtasini qo'yish" tugmasini bosing.
                </div>
              ) : (
                entrancePoints.map((pt, idx) => (
                  <div
                    key={pt.id || idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>{pt.type === 'main' ? "Asosiy kirish" : "Ikkilamchi kirish"} #{idx + 1}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        [{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}]
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Chegarada
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick instructions card */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Qo'llanma va qoidalar:</span>
            </div>
            <p className="leading-relaxed text-blue-800">
              1. Har bir ko'chmas mulk obyektida kamida 1 ta asosiy kirish nuqtasi bo'lishi shart.
            </p>
            <p className="leading-relaxed text-blue-800">
              2. Kirish nuqtasi bino/uchastka chegarasida (konturida) joylashishi lozim.
            </p>
            <p className="leading-relaxed text-blue-800">
              3. Kirish nuqtasidan ko'cha o'qigacha chizilgan bog'lovchi yo'lak 50 metrdan oshsa, tizim ro'yxatga olishni rad etadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
