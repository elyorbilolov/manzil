import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  MapPin,
  GitBranch,
  Trash2,
  Cpu,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Award
} from 'lucide-react';

export const GuidePage: React.FC = () => {
  const [openSection, setOpenSection] = useState<string>('c01');

  const toggle = (sec: string) => {
    setOpenSection(openSection === sec ? '' : sec);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          <span>Foydalanuvchi Qo'llanmasi va Texnik Yo'riqnoma</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          TTZ 4.2.22 (Қўлланма модули) | Vazirlar Mahkamasining 2018 yil 14 dekabrdagi 1010-son qarori
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {/* Section 1: C-01 Yangi manzil shakllantirish */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggle('c01')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                C-01
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  1. Yangi manzil shakllantirish va o'zgartirish reglamenti (C-01)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Arizalarni qabul qilishdan boshlab rasmiy geokod berishgacha bo'lgan to'liq bosqichlar
                </p>
              </div>
            </div>
            {openSection === 'c01' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSection === 'c01' && (
            <div className="p-6 border-t border-slate-100 space-y-3 text-slate-700 leading-relaxed bg-slate-50/50">
              <p>
                <strong>C-01 Reglamenti quyidagi 6 ta asosiy qadamdan iborat:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Arizani qabul qilish:</strong> UZKAD, MyGov, YIDXP, DXM yoki to'g'ridan-to'g'ri tizim orqali arizachi ma'lumotlari va ko'chmas mulk kadastr raqami qabul qilinadi.
                </li>
                <li>
                  <strong>Filial DKP MM (Ijrochi):</strong> Xaritada obyekt chegarasini ko'rib chiqadi, bino/uchastka chegarasi ustida <em>"Kirish va asosiy kirish nuqtasi"</em>ni belgilaydi. Agar obyekt ko'chaga bevosita tutashmagan bo'lsa, <em>"Bog'lovchi nuqta va/yoki chiziq"</em> (yo'lak) chizadi.
                </li>
                <li>
                  <strong>Filial rahbari DKP:</strong> Ma'lumotlarni tekshiradi, avtomatik manzil moduli orqali geokod biriktiradi va tasdiqlaydi. Agar bog'lovchi chiziq mavjud bo'lsa, ariza Hududiy boshqarmaga yo'naltiriladi.
                </li>
                <li>
                  <strong>Hudud DKP MM (Viloyat):</strong> Bog'lovchi yo'lakni kelishadi va Respublika DKP MM ga yuboradi.
                </li>
                <li>
                  <strong>Respublika DKP MM:</strong> Yakuniy tasdiqni beradi.
                </li>
                <li>
                  <strong>Reestrga kiritish va Ma'lumotnoma:</strong> Bepul xizmatda darhol, pullik xizmatda invoys to'langandan so'ng manzil yagona reestrga kiritiladi va QR-kodli elektron ma'lumotnoma beriladi.
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Section 2: GIS Xarita va 50 metr qoidasi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggle('gis')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                GIS
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  2. GIS Xarita: Kirish nuqtalari va 50 metrlik bog'lovchi yo'lak qoidasi
                </h3>
                <p className="text-[11px] text-slate-500">
                  TTZ 4.2.11 va 4.2.12 bo'yicha qat'iy geofazoviy talablar
                </p>
              </div>
            </div>
            {openSection === 'gis' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSection === 'gis' && (
            <div className="p-6 border-t border-slate-100 space-y-3 text-slate-700 leading-relaxed bg-slate-50/50">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
                ⚠️ <strong>Muhim texnik qoida (TTZ 4.2.11):</strong> Ko'cha mavjud bo'lmagan hududlarda yoki ichki hovlilarda obyektga kirish uchun chiziladigan bog'lovchi yo'lak uzunligi <strong>50 metrdan oshmasligi shart!</strong> Agar uzunlik 50m dan oshsa, tizim avtomatik ogohlantirish beradi va arizani yuborishga yo'l qo'ymaydi.
              </div>
              <p>
                <strong>Kirish nuqtalari talabi (TTZ 4.2.12):</strong> Har bir mulkka kamida bitta <em>Asosiy kirish eshigi (darvozasi)</em> ko'chmas mulk chegarasining ustiga (konturiga) qo'yilishi shart.
              </p>
            </div>
          )}
        </div>

        {/* Section 3: C-02 Manzilni o'chirish */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggle('c02')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                C-02
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  3. Manzilni o'chirish so'rovi va kelishuvi (C-02)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mulk buzilganda yoki o'zgarganda 4 bosqichli bekor qilish reglamenti
                </p>
              </div>
            </div>
            {openSection === 'c02' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSection === 'c02' && (
            <div className="p-6 border-t border-slate-100 space-y-3 text-slate-700 leading-relaxed bg-slate-50/50">
              <p>
                Manzilni o'chirish faqat rasmiy huquqiy hujjat (Hokim qarori, sud hujjati yoki buzish dalolatnomasi) asosida amalga oshiriladi:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>1. Filial DKP MM: Asos hujjat raqami va sanasini kiritib taklif beradi.</li>
                <li>2. Filial rahbari DKP: Ko'rib chiqib, Hudud DKP MM ga yuboradi.</li>
                <li>3. Hudud DKP MM: Kelishadi va Respublika DKP MM ga yo'naltiradi.</li>
                <li>4. Respublika DKP MM: Tasdiqlagach, manzil faol reestrdan o'chiriladi va arxivlanadi.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 4: C-03 Avtomatik o'chirish */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggle('c03')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                C-03
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  4. UZKAD Tizimidan Avtomatik O'chirish (C-03 Integratsiya)
                </h3>
                <p className="text-[11px] text-slate-500">
                  UZKAD xabarnomalari asosida inson omilisiz 5 daqiqa ichida avtomatik o'chirish
                </p>
              </div>
            </div>
            {openSection === 'c03' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSection === 'c03' && (
            <div className="p-6 border-t border-slate-100 space-y-3 text-slate-700 leading-relaxed bg-slate-50/50">
              <p>
                Ko'chmas mulk kadastri (UZKAD) tizimida obyekt buzilgani (demolished), birlashtirilgani yoki sud qarori bilan yo'qotilgani qayd etilganda, axborot tizimiga integratsion shlyuz orqali webhook yuboriladi. Tizim avtomatik ravishda kadastr raqamiga mos manzilni topadi va 5 minutdan kamroq vaqtda uni bekor qilib arxivga o'tkazadi.
              </p>
            </div>
          )}
        </div>

        {/* Section 5: Unikal Geokod Tuzilishi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggle('geocode')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                GEO
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  5. Unikal Geokod Tuzilishi va Ma'lumotnoma Haqiqiyligi
                </h3>
                <p className="text-[11px] text-slate-500">
                  Davlat standartiga muvofiq 16 xonali unikal identifikator
                </p>
              </div>
            </div>
            {openSection === 'geocode' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {openSection === 'geocode' && (
            <div className="p-6 border-t border-slate-100 space-y-3 text-slate-700 leading-relaxed bg-slate-50/50">
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs">
                Format: <strong className="text-emerald-800">UZ-[VILOYAT]-[TUMAN]-[YIL]-[RAQAM]</strong>
                <br />
                Masalan: <strong className="text-emerald-800">UZ-TAS-CHI-2026-004819</strong>
              </div>
              <p>
                Har bir manzil ma'lumotnomasi (ko'chirmasi) unikal QR-kod bilan ta'minlanadi. Har qanday smartfon kamerasi orqali QR-kod skanerlanganda tizimdagi rasmiy davlat reestri sahifasi ochiladi va manzilning haqiqiyligi isbotlanadi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
