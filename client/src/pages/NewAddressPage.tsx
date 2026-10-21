import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GISMap } from '../components/GISMap';
import { EntrancePoint, ConnectingLine, ApplicationC01, StreetType, PlanningStructureType } from '../types';
import {
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Sparkles,
  Send,
  Building,
  User,
  CreditCard
} from 'lucide-react';

export const NewAddressPage: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [source, setSource] = useState<'UZKAD' | 'MYGOV' | 'YIDXP' | 'DXM' | 'DIRECT'>('MYGOV');
  const [applicantType, setApplicantType] = useState<'INDIVIDUAL' | 'LEGAL'>('INDIVIDUAL');
  const [applicantName, setApplicantName] = useState('');
  const [applicantPinflOrStir, setApplicantPinflOrStir] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('+998 ');
  const [cadastreNumber, setCadastreNumber] = useState('10:04:02:01:01:0099');

  // Address Elements
  const [region, setRegion] = useState('Toshkent shahri');
  const [district, setDistrict] = useState('Chilonzor tumani');
  const [postalCode, setPostalCode] = useState('100097');
  const [planningStructureType, setPlanningStructureType] = useState<PlanningStructureType>('mavze');
  const [planningStructureName, setPlanningStructureName] = useState('Chilonzor 9-mavze');
  const [streetType, setStreetType] = useState<StreetType>('kocha');
  const [streetName, setStreetName] = useState('Lutfiy ko\'chasi');
  const [houseNumber, setHouseNumber] = useState('25');
  const [blockNumber, setBlockNumber] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [objectType, setObjectType] = useState<'turar_joy' | 'noturar' | 'yer_uchastkasi'>('turar_joy');

  // Map elements
  const [lat, setLat] = useState(41.2858);
  const [lng, setLng] = useState(69.2036);
  const [boundaryPolygon, setBoundaryPolygon] = useState<[number, number][]>([
    [41.2861, 69.2032],
    [41.2862, 69.2041],
    [41.2855, 69.2042],
    [41.2854, 69.2033],
  ]);
  const [entrancePoints, setEntrancePoints] = useState<EntrancePoint[]>([]);
  const [connectingLine, setConnectingLine] = useState<ConnectingLine | null>(null);
  const [mapTool, setMapTool] = useState<'none' | 'add_entrance' | 'draw_line'>('none');

  // Payment
  const [isPaidService, setIsPaidService] = useState(false);

  // Auto fetch parcel boundary from UZKAD
  const fetchUzkadParcel = async () => {
    try {
      const res = await api.getUzkadParcelLookup(cadastreNumber);
      if (res.success) {
        setBoundaryPolygon(res.boundaryPolygon);
        setApplicantName(res.ownerName);
        setApplicantPinflOrStir(res.pinflOrStir);
        if (res.boundaryPolygon.length > 0) {
          setLat(res.boundaryPolygon[0][0]);
          setLng(res.boundaryPolygon[0][1]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEntranceAdded = (point: EntrancePoint) => {
    setEntrancePoints([...entrancePoints, point]);
    setMapTool('none');
  };

  const handleLineCompleted = (line: ConnectingLine) => {
    setConnectingLine(line);
    setMapTool('none');
  };

  const handleSubmit = async () => {
    // Validation
    if (connectingLine && connectingLine.lengthMeters > 50) {
      setErrorMsg("TTZ 4.2.11 talabi: Bog'lovchi yo'lak uzunligi 50 metrdan oshmasligi kerak!");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: Partial<ApplicationC01> = {
        source,
        applicantType,
        applicantName: applicantName || 'Hurmatli Fuqaro',
        applicantPinflOrStir: applicantPinflOrStir || '30000000000000',
        applicantPhone,
        cadastreNumber,
        region,
        district,
        postalCode,
        planningStructureType,
        planningStructureName,
        streetType,
        streetName,
        houseNumber,
        blockNumber,
        unitNumber,
        objectType,
        lat,
        lng,
        boundaryPolygon,
        entrancePoints,
        connectingLine: connectingLine || undefined,
        isPaidService,
      };

      const res = await api.createApplication(payload);
      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Arizani yuborishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Yangi manzil shakllantirish (C-01 Workflow)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Vazirlar Mahkamasining 1010-son qarori va TTZ talablari bo'yicha manzillashtirish jarayoni
        </p>

        {/* Steps Breadcrumb */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-xs">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              1
            </span>
            <span>Ariza va Kadastr</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200"></div>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              2
            </span>
            <span>Manzil elementlari</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200"></div>
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              3
            </span>
            <span>GIS va Kirish nuqtalari</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200"></div>
          <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              4
            </span>
            <span>Avto-geokod va Tasdiq</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Ariza va Kadastr */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>1-qadam: Ariza manbasi va Ko'chmas mulk ma'lumotlari</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kelib tushish manbasi (TTZ):</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="MYGOV">Yagona portal (MyGov / YIDXP)</option>
                <option value="UZKAD">UZKAD tizimi (Kadastr avtomatlashtirilgan)</option>
                <option value="DXM">Davlat xizmatlari markazi (DXM)</option>
                <option value="DIRECT">To'g'ridan-to'g'ri murojaat (DKP binosida)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ariza beruvchi toifasi:</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="appType"
                    checked={applicantType === 'INDIVIDUAL'}
                    onChange={() => setApplicantType('INDIVIDUAL')}
                    className="text-emerald-600"
                  />
                  <span>Jismoniy shaxs</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="appType"
                    checked={applicantType === 'LEGAL'}
                    onChange={() => setApplicantType('LEGAL')}
                    className="text-emerald-600"
                  />
                  <span>Yuridik shaxs</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {applicantType === 'INDIVIDUAL' ? 'JSHSHIR (ПИНФЛ 14 xonali):' : 'STIR (ИНН 9 xonali):'}
              </label>
              <input
                type="text"
                value={applicantPinflOrStir}
                onChange={e => setApplicantPinflOrStir(e.target.value)}
                placeholder="30101950000000"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                {applicantType === 'INDIVIDUAL' ? 'Fuqaro F.I.Sh:' : 'Tashkilot to\'liq nomi:'}
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={e => setApplicantName(e.target.value)}
                placeholder="Familiya Ism Sharif"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telefon raqami:</label>
              <input
                type="text"
                value={applicantPhone}
                onChange={e => setApplicantPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ko'chmas mulk kadastr raqami:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cadastreNumber}
                  onChange={e => setCadastreNumber(e.target.value)}
                  placeholder="10:04:02:01:01:0024"
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 font-mono font-semibold"
                />
                <button
                  type="button"
                  onClick={fetchUzkadParcel}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 rounded-xl flex items-center space-x-1"
                  title="UZKAD bazasidan ma'lumotlarni tortish"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>UZKAD</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center space-x-2"
            >
              <span>Keyingi: Manzil elementlari</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Manzil Elementlari */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>2-qadam: Manzilni shakllantiruvchi elementlar (TTZ 4.1.1.1)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Viloyat / Hudud:</label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Toshkent shahri">Toshkent shahri</option>
                <option value="Toshkent viloyati">Toshkent viloyati</option>
                <option value="Samarqand viloyati">Samarqand viloyati</option>
                <option value="Buxoro viloyati">Buxoro viloyati</option>
                <option value="Farg'ona viloyati">Farg'ona viloyati</option>
                <option value="Andijon viloyati">Andijon viloyati</option>
                <option value="Namangan viloyati">Namangan viloyati</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tuman / Shahar:</label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pochta indeksi (6 xonali):</label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rejalashtirish tuzilmasi turi:</label>
              <select
                value={planningStructureType}
                onChange={e => setPlanningStructureType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="mavze">Mavze (массив)</option>
                <option value="mikrorayon">Mikrorayon</option>
                <option value="turar_joy_massivi">Turar-joy massivi</option>
                <option value="ishlab_chiqarish_maydoni">Ishlab chiqarish maydoni (Sanoat zonasi)</option>
                <option value="hudud">Mahalla / Hudud</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mahalla / Mavze nomi:</label>
              <input
                type="text"
                value={planningStructureName}
                onChange={e => setPlanningStructureName(e.target.value)}
                placeholder="Chilonzor-M mavzesi"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Yo'l tarmog'i elementi:</label>
              <select
                value={streetType}
                onChange={e => setStreetType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="kocha">Ko'cha</option>
                <option value="shoh_kocha">Shoh ko'cha (prospekt)</option>
                <option value="xiyobon">Xiyobon (bulvar)</option>
                <option value="berk_kocha">Berk ko'cha</option>
                <option value="magistral">Magistral yo'l</option>
                <option value="bolak">Bo'lak / Tor ko'cha</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Ko'cha nomi (Geonames):</label>
              <input
                type="text"
                value={streetName}
                onChange={e => setStreetName(e.target.value)}
                placeholder="Cho'ponota ko'chasi"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Uy / Yer raqami:</label>
              <input
                type="text"
                value={houseNumber}
                onChange={e => setHouseNumber(e.target.value)}
                placeholder="6-B"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bino / Korpus:</label>
              <input
                type="text"
                value={blockNumber}
                onChange={e => setBlockNumber(e.target.value)}
                placeholder="1"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Xonadon / Birlik:</label>
              <input
                type="text"
                value={unitNumber}
                onChange={e => setUnitNumber(e.target.value)}
                placeholder="14"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Obyekt turi:</label>
              <select
                value={objectType}
                onChange={e => setObjectType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="turar_joy">Turar joy</option>
                <option value="noturar">Noturar bino</option>
                <option value="yer_uchastkasi">Yer uchastkasi</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center space-x-2"
            >
              <span>Keyingi: GIS va Kirish nuqtalari</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: GIS va Kirish Nuqtalari */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>3-qadam: Kirish nuqtasi va Bog'lovchi yo'lak (TTZ 4.2.11, 4.2.12)</span>
              </h2>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Kirish nuqtasi chegara ustida bo'lishi, bog'lovchi yo'lak esa 50 metrdan oshmasligi shart.
              </p>
            </div>

            {/* Map Tools */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setMapTool(mapTool === 'add_entrance' ? 'none' : 'add_entrance')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  mapTool === 'add_entrance'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Kirish nuqtasini qo'yish</span>
              </button>

              <button
                type="button"
                onClick={() => setMapTool(mapTool === 'draw_line' ? 'none' : 'draw_line')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  mapTool === 'draw_line'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Bog'lovchi chiziq (max 50m)</span>
              </button>
            </div>
          </div>

          {/* Interactive GIS Map */}
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <GISMap
              addresses={[
                {
                  id: 'temp-app',
                  geocode: 'Yangi shakllantirilmoqda',
                  cadastreNumber,
                  region,
                  district,
                  postalCode,
                  streetType,
                  streetName,
                  houseNumber,
                  fullAddressUz: `${region}, ${district}, ${streetName}, ${houseNumber}-uy`,
                  fullAddressUzCyrillic: '',
                  fullAddressRu: '',
                  objectType,
                  lat,
                  lng,
                  boundaryPolygon,
                  entrancePoints,
                  connectingLine: connectingLine || undefined,
                  status: 'active',
                  createdAt: '',
                  updatedAt: '',
                  createdBy: '',
                },
              ]}
              interactiveMode={mapTool}
              onEntranceAdded={handleEntranceAdded}
              onLineCompleted={handleLineCompleted}
              height="400px"
              center={[lat, lng]}
              zoom={16}
            />
          </div>

          {/* Points list info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Kirish nuqtalari ({entrancePoints.length} ta):</div>
              {entrancePoints.length === 0 ? (
                <p className="text-slate-400 italic">Hali kirish nuqtasi belgilanmagan</p>
              ) : (
                <div className="space-y-1">
                  {entrancePoints.map((ep, idx) => (
                    <div key={ep.id} className="flex justify-between font-mono text-[11px] text-slate-600">
                      <span>{idx + 1}. {ep.name}:</span>
                      <span>{ep.lat.toFixed(5)}, {ep.lng.toFixed(5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Bog'lovchi chiziq holati:</div>
              {connectingLine ? (
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Uzunligi:</span>
                    <span className={connectingLine.lengthMeters > 50 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {connectingLine.lengthMeters} metr
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {connectingLine.lengthMeters <= 50 ? (
                      <span className="text-emerald-600">✓ 50 metrlik limitga to'liq mos keladi</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✗ 50m limitdan oshib ketdi! Qayta chizing.</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic">Bog'lovchi chiziq talab etilmadi (ko'chaga bevosita tutash)</p>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center space-x-2"
            >
              <span>Keyingi: Tekshirish va Yuborish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Yakuniy Tekshirish va Tasdiqlash */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>4-qadam: Avtomatik manzil berish moduli va Reglament</span>
          </h2>

          {/* Generated Address Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Shakllantiriladigan rasmiy manzil:
            </span>
            <p className="text-base font-black text-slate-900">
              {region}, {district}, {planningStructureName}, {streetName}, {houseNumber}-uy
              {blockNumber ? `, ${blockNumber}-bino` : ''} {unitNumber ? `, ${unitNumber}-xonadon` : ''}
            </p>
            <div className="flex items-center space-x-4 pt-1 text-slate-600">
              <span>Kadastr: <strong className="font-mono text-slate-800">{cadastreNumber}</strong></span>
              <span>Pochta: <strong className="font-mono text-slate-800">{postalCode}</strong></span>
              <span>Turi: <strong className="capitalize text-slate-800">{objectType}</strong></span>
            </div>
          </div>

          {/* Workflow Routing Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="font-bold text-slate-900 text-xs">C-01 Kelishuv yo'nalishi (Swimlane):</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-700 block">1. Filial DKP MM</span>
                <span className="text-[11px] text-slate-500">Kirish nuqtalari va bog'lovchi yo'lakni tasdiqlaydi</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-amber-700 block">2. Filial rahbari DKP</span>
                <span className="text-[11px] text-slate-500">Geokod biriktiradi va tasdiqlaydi</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-purple-700 block">
                  3. {connectingLine ? 'Hudud & Respublika DKP' : 'To\'lov / Reestr'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {connectingLine ? 'Bog\'lovchi chiziq bo\'yicha yuqori bosqich kelishuvi' : 'Darhol reestrga qo\'shish'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Type Selection */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-slate-600" />
              <span>Xizmat to'lovi turi:</span>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="payment"
                  checked={!isPaidService}
                  onChange={() => setIsPaidService(false)}
                  className="text-emerald-600"
                />
                <span>Bepul (Standart davlat xizmati - darhol reestrga)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="payment"
                  checked={isPaidService}
                  onChange={() => setIsPaidService(true)}
                  className="text-emerald-600"
                />
                <span>To'lov asosida (Invoys generatsiya qilinadi: 68 000 so'm)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3 rounded-xl flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Yuborilmoqda...' : 'Arizani C-01 Reglamentiga yuborish'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
