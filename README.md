# "Ko'chmas mulk obyektlari manzillari reestri" Axborot Tizimi (Manzillar Reestri AT)

O'zbekiston Respublikasi Iqtisodiyot va moliya vazirligi huzuridagi **Kadastr agentligi** hamda **Davlat kadastrlari palatasi** buyurtmasi asosida, Vazirlar Mahkamasining 2018 yil 14 dekabrdagi 1010-son qarori hamda 64 varaqli rasmiy **Texnik Topshiriq (TTZ)** va Texnik yo'riqnoma (C-01, C-02, C-03 diagrammalar) talablariga 100% muvofiq ishlab chiqilgan mukammal axborot tizimi platformasi.

---

## 🏛️ Normativ-huquqiy va Standart Asoslari
Tizim quyidagi davlat standartlari va me'yoriy hujjatlarga qat'iy muvofiq yaratilgan:
- **O'zMSt 1987:2018** — Axborot texnologiyalari. Axborot tizimini yaratish bo'yicha texnik topshiriqlar;
- **O'zMSt 2590:2012** — Davlat organlari axborot tizimlarini integratsiyalashuvi va o'zaro hamkorligiga qo'yiladigan talablar. Milliy axborot tizimi;
- **O'zMSt 1985:2018** — Axborot tizimlarini yaratishda hujjatlarning turlari va belgilanishi;
- **O'zMSt 1105:2009** — Axborotni kriptografik himoya qilish.

---

## 🚀 Texnologik Stack (TTZ 4.3.4 talablari bo'yicha)
- **Frontend**: React 18, TypeScript, TailwindCSS, Leaflet & React-Leaflet (GIS xarita), Lucide Icons, QR-Code generatsiyasi.
- **Backend**: Node.js, Express, TypeScript REST API, JWT sessiyalar, CORS, Audit logging.
- **Ma'lumotlar bazasi**: PostgreSQL 18+ DDL PostGIS schemalari (`server/postgres-schema.sql`) va avtomatik initsializatsiyalanuvchi JSON/file-based DB storage.
- **Interfeys tillari (TTZ 4.1.7)**: O'zbekcha (lotin), Ўзбекча (кирилл), Русский.

---

## 📋 Tizimning Asosiy Modullari (TTZ 4.2 bo'limi)

1. **Avtorizatsiya va OneID (4.2.2 & C1)**:
   - Yagona identifikatsiya tizimi (OneID) orqali JSHSHIR (ПИНФЛ) asosida SSO kirish.
   - Ommaviy oferta va shaxsiy ma'lumotlardan foydalanish roziligi (majburiy shart).
   - Rollar bo'yicha differensiatsiyalashgan kirish modeli (RBAC).

2. **Monitoring va Tahliliy Dashboard (4.2.5)**:
   - Jami, faol va bekor qilingan manzillar statistikasi.
   - Jarayondagi arizalar soni va SLA (99.98% mavjudlik, <500ms javob vaqti).
   - Hududlar kesimida interaktiv taqsimot va diagrammalar.

3. **Manzillar Reestri (4.2.7)**:
   - Tasdiqlangan manzillar ro'yxati, ko'p parametrli qidiruv (geokod, ko'cha, kadastr raqami).
   - Obyekt turi: Turar-joy, noturar bino, yer uchastkasi.
   - Rasmiy ma'lumotnoma (ko'chirma) shakllantirish (davlat gerbi, unikal QR-kod, ERI shtampi bilan).
   - CSV / Excel formatlarida eksport.

4. **Interaktiv GIS Xarita Moduli**:
   - Kadastr chegaralari (polygon), ko'chalar, binolar va joylashuv nuqtalari.
   - **Kirish va asosiy kirish nuqtalari (4.2.12)**: Bino yoki yer uchastkasi chegarasi ustiga darvoza/kirish eshigini belgilash.
   - **Bog'lash nuqta va/yoki chiziqlarini yaratish (4.2.11)**: Agar obyekt ko'chaga bevosita ulanmagan bo'lsa, bog'lovchi yo'lak chizish.
   - **50 metr cheklovi nazorati**: TTZ talabiga ko'ra, chiziq uzunligi 50 metrdan oshganda tizim qat'iy ogohlantiradi va ortig'iga yo'l qo'ymaydi!

5. **C-01: Yangi manzil shakllantirish va o'zgartirish reglamenti**:
   - 4 bosqichli interaktiv usta (Wizard).
   - Swimlane tasdiqlash yo'nalishi:
     * *Filial DKP MM (Ijrochi)* &rarr; Kirish nuqtasini belgilaydi, avto-manzil moduli orqali geokod tayinlaydi.
     * *Filial rahbari DKP* &rarr; Geokod va manzilni tasdiqlaydi (agar bog'lovchi yo'lak bo'lsa yuqoriga uzatadi).
     * *Hudud DKP MM (Viloyat)* &rarr; Bog'lovchi yo'lakni kelishadi.
     * *Respublika DKP MM* &rarr; Yakuniy tasdiqni beradi.
     * *To'lov / Reestr* &rarr; Bepul xizmatda darhol, pullik bo'lsa invoys to'langach reestrga kiritiladi.

6. **C-02: Manzil ma'lumotlarini o'chirish reglamenti**:
   - Huquqiy asos bo'lgan hujjat (hokim qarori, sud hujjati) asosida o'chirish taklifi.
   - 4 bosqichli tasdiqlash: Filial MM &rarr; Filial rahbari &rarr; Hudud MM &rarr; Respublika MM.
   - Reestrdan chiqarish va arxiv bazasiga o'tkazish.

7. **C-03: UZKAD Tizimidan Avtomatik O'chirish (Webhook)**:
   - Ko'chmas mulk buzilganda yoki tugatilganda UZKADdan xabarnoma qabul qiluvchi API.
   - Inson omilisiz 5 daqiqa ichida avtomatik ravishda manzilni bekor qilish va arxivga o'tkazish.

8. **Foydalanuvchilar va Rollarni Boshqarish (RBAC - 4.2.14, 4.2.15, 4.2.17)**:
   - 7 ta rasmiy rol:
     1. `RESPUBLIKA_DKP_MM` (Respublika DKP mutaxassisi)
     2. `HUDUD_DKP_MM` (Viloyat boshqarma mutaxassisi)
     3. `FILIAL_RAHBARI_DKP` (Tuman/shahar filiali rahbari)
     4. `FILIAL_DKP_MM` (Tuman ijrochi mutaxassisi)
     5. `ADMIN` (Tizim administratori)
     6. `INSPECTOR` (Nazoratchi / mas'ul xodim)
     7. `CITIZEN` (Kuzatuvchi / Tinglovchi)
   - Ruxsatlar matritsasi va boshqaruv.

9. **Tizimdagi barcha amallarni qayd etish (Audit Log - 4.2.18)**:
   - TTZ talabi bo'yicha 7 ta toifadagi to'liq monitoring:
     * `AUTH` — Kirish/chiqish, urinishlar
     * `AUTHORIZATION` — Ruxsat berildi/rad etildi
     * `USER_ACTION` — Qo'shish, tahrirlash, o'chirish, ko'rish
     * `ADMIN_ACTION` — Sozlamalar, rollar
     * `SYSTEM` — Servis start, restart
     * `DATA_OPERATION` — Import/eksport, zaxira
     * `SECURITY` — Shubhali faollik, bloklashlar

10. **Tashqi Integratsiyalar Shlyuzi (4.1.2, 4.2.13, 4.2.21)**:
    - OneID (Ягона идентификация тизими)
    - UZKAD (Ko'chmas mulk kadastri)
    - Geonames (Geografik obyektlar milliy reestri)
    - Raqamli texnologiyalar vazirligi (Pochta indekslari)
    - Markaziy saylov komissiyasi (MSK)
    - MyGov / YIDXP (Yagona portal)

11. **Zaxiralash va Qayta Tiklash (Backup & Restore - 4.2.19, 4.2.20)**:
    - Bir marta bosish orqali to'liq JSON zaxira nusxasini yuklab olish.
    - Zaxiradan ma'lumotlarni qayta tiklash.
    - Arxivlangan manzillar registri.

12. **Qo'llanma va Texnik Ko'mak (4.2.22, 4.2.23)**:
    - Interaktiv foydalanuvchi qo'llanmasi, C-01/C-02/C-03 sxemalari tushuntirishi.
    - 24/7 Texnik yordam murojaatlari (Ticket) tizimi.

---

## 💻 Tizimni Ishga Tushirish

### 1. Barcha modullarni o'rnatish:
Loyiha ildiz papkasida:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Loyihani to'liq ishga tushirish (Frontend + Backend):
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend Web Portal**: `http://localhost:3000` (yoki `http://localhost:5000`)

### 3. PostgreSQL 18+ Enterprise Schemasi:
Agar PostgreSQL serverga ulash kerak bo'lsa, `server/postgres-schema.sql` fayli orqali barcha jadvallar, PostGIS indekslari va cheklovlar to'g'ridan-to'g'ri yaratiladi.

---

## 🛡️ Demo va Test Sinovlari
Header qismidagi **"Rolni tanlash (Demo ko'rinish)"** tugmasi orqali istalgan rolni (Filial MM, Filial Rahbari, Viloyat MM, Respublika MM, Administrator, Fuqaro) bir marta bosish orqali faollashtirib, har bir reglament bosqichini sinovdan o'tkazishingiz mumkin.
