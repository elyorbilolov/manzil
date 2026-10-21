import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db } from './storage';
import {
  User,
  Address,
  ApplicationC01,
  CancellationRequestC02,
  UzkadWebhookEventC03,
  SupportTicket,
  UserRole,
} from './types';
import { generateGeocode, formatFullAddress, calculateDistanceMeters } from './utils/geocode';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Helper to get client IP
const getClientIp = (req: Request) => {
  return (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
};

// ==========================================
// 1. AUTENTIFIKATSIYA VA ONEID (TTZ 4.2.2 & C1)
// ==========================================

// Login (Classic or PINFL)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  const ip = getClientIp(req);

  const users = db.getUsers();
  const user = users.find(u => u.email === identifier || u.pinfl === identifier);

  if (!user) {
    db.addAuditLog({
      category: 'AUTH',
      action: 'Muvaffaqiyatsiz kirish urinishi',
      userName: identifier || 'Noma\'lum',
      ip,
      details: 'Foydalanuvchi topilmadi',
      status: 'ERROR',
    });
    return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi yoki parol noto\'g\'ri' });
  }

  if (!user.isActive) {
    db.addAuditLog({
      category: 'SECURITY',
      action: 'Bloklangan hisob bilan kirish urinishi',
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      ip,
      details: `Bloklangan foydalanuvchi: ${user.email}`,
      status: 'WARNING',
    });
    return res.status(403).json({ success: false, message: 'Ushbu hisob ma\'murlar tomonidan bloklangan' });
  }

  user.lastLoginAt = new Date().toISOString();
  db.saveUser(user);

  db.addAuditLog({
    category: 'AUTH',
    action: 'Tizimga muvaffaqiyatli kirish',
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    ip,
    details: `Rol: ${user.role}, Filial: ${user.district}`,
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    token: `token-${user.id}-${Date.now()}`,
    user,
  });
});

// OneID SSO Simulation (TTZ C1)
app.post('/api/auth/oneid', (req: Request, res: Response) => {
  const { pinfl, fullName, email, phone } = req.body;
  const ip = getClientIp(req);

  let user = db.getUsers().find(u => u.pinfl === pinfl || (email && u.email === email));

  if (!user) {
    // New user via OneID - starts with CITIZEN ("Tinglovchi") role as mandated by TTZ page 19
    user = {
      id: `user-${Date.now()}`,
      pinfl: pinfl || '30101950070055',
      fullName: fullName || 'Yangi OneID Foydalanuvchisi',
      email: email || `oneid_${Date.now()}@oneid.uz`,
      phone: phone || '+998 90 000-00-00',
      role: 'CITIZEN',
      region: 'Toshkent shahri',
      district: 'Chilonzor tumani',
      isActive: true,
      termsAccepted: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    db.saveUser(user);

    db.addAuditLog({
      category: 'AUTH',
      action: 'OneID orqali yangi foydalanuvchi ro\'yxatdan o\'tdi',
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      ip,
      details: `JSHSHIR: ${user.pinfl}, Birlamchi rol: Tinglovchi (CITIZEN)`,
      status: 'SUCCESS',
    });
  } else {
    user.lastLoginAt = new Date().toISOString();
    db.saveUser(user);

    db.addAuditLog({
      category: 'AUTH',
      action: 'OneID SSO orqali kirish',
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      ip,
      details: `OneID identifikatsiya muvaffaqiyatli: ${user.pinfl}`,
      status: 'SUCCESS',
    });
  }

  res.json({
    success: true,
    token: `oneid-token-${user.id}-${Date.now()}`,
    user,
  });
});

// Quick Role Switcher (for demo/evaluating all 7 roles specified in TTZ)
app.post('/api/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body as { role: UserRole };
  const targetUser = db.getUsers().find(u => u.role === role);

  if (targetUser) {
    db.addAuditLog({
      category: 'AUTHORIZATION',
      action: 'Foydalanuvchi roli almashtirildi (Demo)',
      userId: targetUser.id,
      userName: targetUser.fullName,
      userRole: targetUser.role,
      ip: getClientIp(req),
      details: `Yangi faol rol: ${role}`,
      status: 'SUCCESS',
    });
    return res.json({ success: true, user: targetUser, token: `token-${targetUser.id}` });
  }

  res.status(404).json({ success: false, message: 'Bu rol uchun namunaviy foydalanuvchi topilmadi' });
});

// Accept Terms of Service (Ommaviy oferta roziligi - TTZ 4.2.2)
app.post('/api/auth/accept-terms', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

  user.termsAccepted = true;
  db.saveUser(user);

  db.addAuditLog({
    category: 'USER_ACTION',
    action: 'Ommaviy oferta va shaxsiy ma\'lumotlar roziligi qabul qilindi',
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    ip: getClientIp(req),
    details: 'Foydalanuvchi ommaviy oferta shartlariga to\'liq rozilik bildirdi',
    status: 'SUCCESS',
  });

  res.json({ success: true, user });
});

// ==========================================
// 2. MANZILLAR REESTRI (TTZ 4.2.7)
// ==========================================

// Get addresses with search and filtering
app.get('/api/addresses', (req: Request, res: Response) => {
  const { q, region, district, status, objectType } = req.query as Record<string, string>;
  let list = db.getAddresses();

  if (status && status !== 'all') {
    list = list.filter(a => a.status === status);
  }
  if (region && region !== 'all') {
    list = list.filter(a => a.region === region);
  }
  if (district && district !== 'all') {
    list = list.filter(a => a.district === district);
  }
  if (objectType && objectType !== 'all') {
    list = list.filter(a => a.objectType === objectType);
  }
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter(
      a =>
        a.fullAddressUz.toLowerCase().includes(term) ||
        a.geocode.toLowerCase().includes(term) ||
        a.cadastreNumber.toLowerCase().includes(term) ||
        a.streetName.toLowerCase().includes(term) ||
        (a.planningStructureName && a.planningStructureName.toLowerCase().includes(term))
    );
  }

  res.json({
    success: true,
    count: list.length,
    addresses: list,
  });
});

// Get single address
app.get('/api/addresses/:id', (req: Request, res: Response) => {
  const addr = db.getAddressById(req.params.id);
  if (!addr) return res.status(404).json({ success: false, message: 'Manzil topilmadi' });
  res.json({ success: true, address: addr });
});

// Create new address directly (e.g. by admin)
app.post('/api/addresses', (req: Request, res: Response) => {
  const data = req.body;
  const addresses = db.getAddresses();
  const sequenceNumber = addresses.length + 1;
  const geocode = data.geocode || generateGeocode(data.region, data.district, sequenceNumber);

  const formatted = formatFullAddress({
    region: data.region,
    district: data.district,
    planningStructureName: data.planningStructureName,
    streetType: data.streetType,
    streetName: data.streetName,
    houseNumber: data.houseNumber,
    blockNumber: data.blockNumber,
    unitNumber: data.unitNumber,
  });

  const newAddress: Address = {
    id: `addr-${Date.now()}`,
    geocode,
    cadastreNumber: data.cadastreNumber || '10:04:00:00:00:0000',
    region: data.region,
    district: data.district,
    postalCode: data.postalCode || '100000',
    planningStructureType: data.planningStructureType,
    planningStructureName: data.planningStructureName,
    streetType: data.streetType || 'kocha',
    streetName: data.streetName,
    houseNumber: data.houseNumber,
    blockNumber: data.blockNumber,
    unitNumber: data.unitNumber,
    fullAddressUz: formatted.uz,
    fullAddressUzCyrillic: formatted.uzCyrillic,
    fullAddressRu: formatted.ru,
    objectType: data.objectType || 'turar_joy',
    lat: data.lat || 41.2858,
    lng: data.lng || 69.2036,
    boundaryPolygon: data.boundaryPolygon,
    entrancePoints: data.entrancePoints || [],
    connectingLine: data.connectingLine,
    status: 'active',
    legalGrounds: data.legalGrounds || "Vazirlar Mahkamasining 1010-son qarori",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: data.createdBy || 'Tizim administratori',
    history: [
      {
        timestamp: new Date().toISOString(),
        action: 'Yangi manzil kiritildi',
        changedBy: data.createdBy || 'Administrator',
        role: 'ADMIN',
        details: `Geokod: ${geocode}`,
      },
    ],
  };

  db.saveAddress(newAddress);

  db.addAuditLog({
    category: 'DATA_OPERATION',
    action: 'Reestrga yangi manzil qo\'shildi',
    userName: data.createdBy || 'Administrator',
    ip: getClientIp(req),
    details: `Manzil: ${newAddress.fullAddressUz}, Geokod: ${geocode}`,
    status: 'SUCCESS',
  });

  res.status(201).json({ success: true, address: newAddress });
});

// Update address
app.put('/api/addresses/:id', (req: Request, res: Response) => {
  const addr = db.getAddressById(req.params.id);
  if (!addr) return res.status(404).json({ success: false, message: 'Manzil topilmadi' });

  const prevAddress = addr.fullAddressUz;
  const updates = req.body;

  Object.assign(addr, updates, { updatedAt: new Date().toISOString() });

  const formatted = formatFullAddress({
    region: addr.region,
    district: addr.district,
    planningStructureName: addr.planningStructureName,
    streetType: addr.streetType,
    streetName: addr.streetName,
    houseNumber: addr.houseNumber,
    blockNumber: addr.blockNumber,
    unitNumber: addr.unitNumber,
  });
  addr.fullAddressUz = formatted.uz;
  addr.fullAddressUzCyrillic = formatted.uzCyrillic;
  addr.fullAddressRu = formatted.ru;

  if (!addr.history) addr.history = [];
  addr.history.push({
    timestamp: new Date().toISOString(),
    action: 'Manzil ma\'lumotlari yangilandi',
    changedBy: updates.updatedBy || 'Operator',
    role: updates.userRole || 'FILIAL_DKP_MM',
    details: `Eski manzil: ${prevAddress} -> Yangi: ${addr.fullAddressUz}`,
  });

  db.saveAddress(addr);

  db.addAuditLog({
    category: 'USER_ACTION',
    action: 'Manzil tahrirlandi',
    userName: updates.updatedBy || 'Operator',
    ip: getClientIp(req),
    details: `Geokod: ${addr.geocode}`,
    status: 'SUCCESS',
  });

  res.json({ success: true, address: addr });
});

// Official Certificate / Extract Data Generator (TTZ 4.2.7)
app.get('/api/addresses/:id/certificate', (req: Request, res: Response) => {
  const addr = db.getAddressById(req.params.id);
  if (!addr) return res.status(404).json({ success: false, message: 'Manzil topilmadi' });

  const certData = {
    certificateNumber: `MK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    issuedDate: new Date().toISOString(),
    cadastreAgency: "O'zbekiston Respublikasi Iqtisodiyot va moliya vazirligi huzuridagi Kadastr agentligi",
    registryName: "Ko'chmas mulk obyektlari manzillari reestri axborot tizimi",
    address: addr,
    qrPayload: `https://manzil.kadastr.uz/verify/${addr.geocode}`,
    digitalSignatureHash: `EDS-${Buffer.from(addr.geocode + addr.cadastreNumber).toString('base64').substring(0, 32)}`,
    verificationUrl: `https://manzil.kadastr.uz/verify/${addr.geocode}`,
  };

  db.addAuditLog({
    category: 'DATA_OPERATION',
    action: 'Manzil bo\'yicha rasmiy ma\'lumotnoma / ko\'chirma shakllantirildi',
    userName: (req.query.userName as string) || 'Foydalanuvchi',
    ip: getClientIp(req),
    details: `Ma'lumotnoma № ${certData.certificateNumber}, Geokod: ${addr.geocode}`,
    status: 'SUCCESS',
  });

  res.json({ success: true, certificate: certData });
});

// ==========================================================
// 3. YANGI MANZIL SHAKLLANTIRISH / O'ZGARTIRISH (C-01 WORKFLOW)
// ==========================================================

// List applications
app.get('/api/applications', (req: Request, res: Response) => {
  const { stage, source, region } = req.query as Record<string, string>;
  let list = db.getApplications();

  if (stage && stage !== 'all') {
    list = list.filter(a => a.stage === stage);
  }
  if (source && source !== 'all') {
    list = list.filter(a => a.source === source);
  }
  if (region && region !== 'all') {
    list = list.filter(a => a.region === region);
  }

  res.json({ success: true, count: list.length, applications: list });
});

// Get single application
app.get('/api/applications/:id', (req: Request, res: Response) => {
  const appItem = db.getApplicationById(req.params.id);
  if (!appItem) return res.status(404).json({ success: false, message: 'Ariza topilmadi' });
  res.json({ success: true, application: appItem });
});

// Submit new C-01 application
app.post('/api/applications', (req: Request, res: Response) => {
  const body = req.body;
  const applications = db.getApplications();
  const appNum = `APP-${new Date().getFullYear()}-${String(applications.length + 101).padStart(5, '0')}`;

  const newApp: ApplicationC01 = {
    id: `app-${Date.now()}`,
    applicationNumber: appNum,
    source: body.source || 'DIRECT',
    applicantType: body.applicantType || 'INDIVIDUAL',
    applicantName: body.applicantName || 'Hurmatli Fuqaro',
    applicantPinflOrStir: body.applicantPinflOrStir || '30101950000000',
    applicantPhone: body.applicantPhone || '+998 90 123-45-67',
    cadastreNumber: body.cadastreNumber || '10:04:01:01:01:0099',
    region: body.region || 'Toshkent shahri',
    district: body.district || 'Chilonzor tumani',
    postalCode: body.postalCode || '100097',
    planningStructureType: body.planningStructureType,
    planningStructureName: body.planningStructureName,
    streetType: body.streetType || 'kocha',
    streetName: body.streetName || 'Yangi ko\'cha',
    houseNumber: body.houseNumber || '1',
    blockNumber: body.blockNumber,
    unitNumber: body.unitNumber,
    objectType: body.objectType || 'turar_joy',
    lat: body.lat || 41.2858,
    lng: body.lng || 69.2036,
    boundaryPolygon: body.boundaryPolygon || [
      [41.2860, 69.2030],
      [41.2861, 69.2040],
      [41.2853, 69.2041],
      [41.2852, 69.2031],
    ],
    entrancePoints: body.entrancePoints || [],
    connectingLine: body.connectingLine,
    isPaidService: body.isPaidService || false,
    invoiceNumber: body.isPaidService ? `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    invoiceAmountUzs: body.isPaidService ? (db.getSettings().defaultInvoiceAmountUzs || 68000) : 0,
    isPaid: !body.isPaidService,
    stage: 'FILIAL_REVIEW',
    timeline: [
      {
        stage: 'SUBMITTED',
        timestamp: new Date().toISOString(),
        actorName: body.applicantName || 'Ariza beruvchi',
        actorRole: 'APPLICANT',
        comment: `Manzil berish arizasi ${body.source || 'to\'g\'ridan-to\'g\'ri'} qabul qilindi`,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveApplication(newApp);

  db.addAuditLog({
    category: 'DATA_OPERATION',
    action: 'Yangi manzil arizasi qabul qilindi (C-01)',
    userName: newApp.applicantName,
    ip: getClientIp(req),
    details: `Ariza: ${appNum}, Manba: ${newApp.source}, Kadastr: ${newApp.cadastreNumber}`,
    status: 'SUCCESS',
  });

  res.status(201).json({ success: true, application: newApp });
});

// Stage 1: Filial DKP MM reviews, sets entrance points & connecting line, activates auto-address assignment
app.post('/api/applications/:id/filial-review', (req: Request, res: Response) => {
  const appItem = db.getApplicationById(req.params.id);
  if (!appItem) return res.status(404).json({ success: false, message: 'Ariza topilmadi' });

  const { entrancePoints, connectingLine, comment, actorName, actorRole } = req.body;

  if (entrancePoints && Array.isArray(entrancePoints)) {
    appItem.entrancePoints = entrancePoints;
  }
  if (connectingLine) {
    // Validate connecting line length constraint (TTZ 4.2.11: max 50m)
    if (connectingLine.lengthMeters > db.getSettings().maxConnectingLineMeters) {
      return res.status(400).json({
        success: false,
        message: `Bog'lovchi chiziq uzunligi ${db.getSettings().maxConnectingLineMeters} metrdan oshmasligi kerak! (Hozirgi uzunlik: ${connectingLine.lengthMeters}m)`,
      });
    }
    appItem.connectingLine = connectingLine;
  }

  // Auto-generate candidate geocode
  const sequenceNum = db.getAddresses().length + db.getApplications().length + 10;
  appItem.assignedGeocode = generateGeocode(appItem.region, appItem.district, sequenceNum);

  // Transition to next stage: Filial Rahbari ko'rib chiqishi
  appItem.stage = 'FILIAL_HEAD_REVIEW';
  appItem.updatedAt = new Date().toISOString();
  appItem.timeline.push({
    stage: 'FILIAL_REVIEW_COMPLETED',
    timestamp: new Date().toISOString(),
    actorName: actorName || "Bo'riyev Komiljon (Filial MM)",
    actorRole: actorRole || 'FILIAL_DKP_MM',
    comment: comment || 'Kirish nuqtalari belgilandi, avtomatik manzil berish moduli orqali geokod tayinlandi va rahbar ko\'rib chiqishiga yuborildi',
  });

  db.saveApplication(appItem);

  db.addAuditLog({
    category: 'USER_ACTION',
    action: 'Filial DKP MM arizaga kirish nuqtalari va manzil biriktirdi',
    userName: actorName || 'Filial DKP MM',
    userRole: 'FILIAL_DKP_MM',
    ip: getClientIp(req),
    details: `Ariza: ${appItem.applicationNumber}, Geokod: ${appItem.assignedGeocode}`,
    status: 'SUCCESS',
  });

  res.json({ success: true, application: appItem });
});

// Stage 2: Filial rahbari DKP approves or sends to region (if connecting line exists) or returns
app.post('/api/applications/:id/filial-head-action', (req: Request, res: Response) => {
  const appItem = db.getApplicationById(req.params.id);
  if (!appItem) return res.status(404).json({ success: false, message: 'Ariza topilmadi' });

  const { action, comment, actorName } = req.body; // action: 'approve' | 'return' | 'reject'

  if (action === 'return') {
    appItem.stage = 'FILIAL_REVIEW';
    appItem.timeline.push({
      stage: 'RETURNED_TO_MM',
      timestamp: new Date().toISOString(),
      actorName: actorName || 'Filial rahbari DKP',
      actorRole: 'FILIAL_RAHBARI_DKP',
      comment: comment || 'Kamchiliklar aniqlangani sababli ijrochiga qaytarildi',
    });
    db.saveApplication(appItem);
    return res.json({ success: true, application: appItem });
  }

  if (action === 'reject') {
    appItem.stage = 'REJECTED';
    appItem.rejectionReason = comment || 'Filial rahbari tomonidan rad etildi';
    appItem.timeline.push({
      stage: 'REJECTED',
      timestamp: new Date().toISOString(),
      actorName: actorName || 'Filial rahbari DKP',
      actorRole: 'FILIAL_RAHBARI_DKP',
      comment: appItem.rejectionReason || 'Rad etildi',
    });
    db.saveApplication(appItem);
    return res.json({ success: true, application: appItem });
  }

  // TTZ C-01 Qoidasi: Agar ko'cha bog'lovchi nuqta/chiziq bo'lsa -> Hudud DKP MM ga kelishuvga ketadi!
  if (appItem.connectingLine && appItem.connectingLine.lengthMeters > 0) {
    appItem.stage = 'REGION_AGREEMENT';
    appItem.timeline.push({
      stage: 'SENT_TO_REGION',
      timestamp: new Date().toISOString(),
      actorName: actorName || 'Omonov Sarvar (Filial rahbari DKP)',
      actorRole: 'FILIAL_RAHBARI_DKP',
      comment: comment || 'Geokod tasdiqlandi. Bog\'lovchi chiziq mavjudligi sababli Hudud DKP MM kelishuviga yuborildi',
    });
  } else {
    // Agar bog'lovchi chiziq bo'lmasa: to'lov tekshiriladi yoki bepul bo'lsa darhol yakunlanadi
    if (appItem.isPaidService && !appItem.isPaid) {
      appItem.stage = 'PAYMENT_PENDING';
      appItem.timeline.push({
        stage: 'PAYMENT_PENDING',
        timestamp: new Date().toISOString(),
        actorName: actorName || 'Filial rahbari DKP',
        actorRole: 'FILIAL_RAHBARI_DKP',
        comment: 'Manzil ma\'lumotlari tasdiqlandi. Invoys bo\'yicha to\'lov kutilmoqda',
      });
    } else {
      finalizeApplication(appItem, actorName || 'Filial rahbari DKP');
    }
  }

  appItem.updatedAt = new Date().toISOString();
  db.saveApplication(appItem);

  db.addAuditLog({
    category: 'AUTHORIZATION',
    action: 'Filial rahbari manzil arizasini tasdiqladi',
    userName: actorName || 'Filial rahbari DKP',
    userRole: 'FILIAL_RAHBARI_DKP',
    ip: getClientIp(req),
    details: `Ariza: ${appItem.applicationNumber}, Bosqich: ${appItem.stage}`,
    status: 'SUCCESS',
  });

  res.json({ success: true, application: appItem });
});

// Stage 3: Hudud DKP MM agrees on connecting line
app.post('/api/applications/:id/region-agreement', (req: Request, res: Response) => {
  const appItem = db.getApplicationById(req.params.id);
  if (!appItem) return res.status(404).json({ success: false, message: 'Ariza topilmadi' });

  const { action, comment, actorName } = req.body;

  if (action === 'return') {
    appItem.stage = 'FILIAL_REVIEW';
    appItem.timeline.push({
      stage: 'REGION_RETURNED',
      timestamp: new Date().toISOString(),
      actorName: actorName || 'Hudud DKP MM',
      actorRole: 'HUDUD_DKP_MM',
      comment: comment || 'Bog\'lovchi chiziqda kamchilik aniqlandi, ijrochiga qaytarildi',
    });
    db.saveApplication(appItem);
    return res.json({ success: true, application: appItem });
  }

  // TTZ C-01 Qoidasi: Hudud DKP MM kelishgach -> Respublika DKP MM ga tasdiqqa ketadi!
  appItem.stage = 'REPUBLIC_APPROVAL';
  appItem.timeline.push({
    stage: 'REGION_AGREED',
    timestamp: new Date().toISOString(),
    actorName: actorName || "Turg'unov Xurshidbek (Hudud DKP MM)",
    actorRole: 'HUDUD_DKP_MM',
    comment: comment || 'Hududiy boshqarma tomonidan bog\'lovchi chiziq kelishildi va Respublika DKP MM ga yuborildi',
  });

  appItem.updatedAt = new Date().toISOString();
  db.saveApplication(appItem);

  db.addAuditLog({
    category: 'AUTHORIZATION',
    action: 'Hudud DKP MM bog\'lovchi chiziqni kelishdi',
    userName: actorName || 'Hudud DKP MM',
    userRole: 'HUDUD_DKP_MM',
    ip: getClientIp(req),
    details: `Ariza: ${appItem.applicationNumber}`,
    status: 'SUCCESS',
  });

  res.json({ success: true, application: appItem });
});

// Stage 4: Respublika DKP MM final approval
app.post('/api/applications/:id/republic-approval', (req: Request, res: Response) => {
  const appItem = db.getApplicationById(req.params.id);
  if (!appItem) return res.status(404).json({ success: false, message: 'Ariza topilmadi' });

  const { action, comment, actorName } = req.body;

  if (action === 'return') {
    appItem.stage = 'FILIAL_REVIEW';
    appItem.timeline.push({
      stage: 'REPUBLIC_RETURNED',
      timestamp: new Date().toISOString(),
      actorName: actorName || 'Respublika DKP MM',
      actorRole: 'RESPUBLIKA_DKP_MM',
      comment: comment || 'Respublika darajasida kamchilik aniqlandi, ijrochiga qaytarildi',
    });
    db.saveApplication(appItem);
    return res.json({ success: true, application: appItem });
  }

  // Agar to'lov kutilsa -> PAYMENT_PENDING, bo'lmasa reestrga qo'shiladi!
  if (appItem.isPaidService && !appItem.isPaid) {
    appItem.stage = 'PAYMENT_PENDING';
    appItem.timeline.push({
      stage: 'REPUBLIC_APPROVED_PAYMENT_PENDING',
      timestamp: new Date().toISOString(),
      actorName: actorName || 'Mirmaqsudov Mirkomil (Respublika DKP MM)',
      actorRole: 'RESPUBLIKA_DKP_MM',
      comment: comment || 'Respublika palatasi tomonidan tasdiqlandi. Invoys bo\'yicha to\'lov kutilmoqda',
    });
  } else {
    finalizeApplication(appItem, actorName || 'Mirmaqsudov Mirkomil (Respublika DKP MM)');
  }

  appItem.updatedAt = new Date().toISOString();
  db.saveApplication(appItem);

  db.addAuditLog({
    category: 'AUTHORIZATION',
    action: 'Respublika DKP MM yakuniy tasdiq berdi',
    userName: actorName || 'Respublika DKP MM',
    userRole: 'RESPUBLIKA_DKP_MM',
    ip: getClientIp(req),
    details: `Ariza: ${appItem.applicationNumber}`,
    status: 'SUCCESS',
  });

  res.json({ success: true, application: appItem });
});

// Pay invoice (Stage 5)
app.post('/api/applications/:id/pay-invoice', (req: Request, res: Response) => {
  const appItem = db.getApplicationById(req.params.id);
  if (!appItem) return res.status(404).json({ success: false, message: 'Ariza topilmadi' });

  appItem.isPaid = true;
  finalizeApplication(appItem, 'Moliya / Bank to\'lov shlyuzi');

  db.addAuditLog({
    category: 'DATA_OPERATION',
    action: 'Manzil berish bo\'yicha invoys to\'landi',
    userName: appItem.applicantName,
    ip: getClientIp(req),
    details: `Invoys: ${appItem.invoiceNumber}, Summa: ${appItem.invoiceAmountUzs} so'm`,
    status: 'SUCCESS',
  });

  res.json({ success: true, application: appItem });
});

// Helper: Finalize application and insert into Address registry
function finalizeApplication(appItem: ApplicationC01, actorName: string) {
  appItem.stage = 'APPROVED';

  const formatted = formatFullAddress({
    region: appItem.region,
    district: appItem.district,
    planningStructureName: appItem.planningStructureName,
    streetType: appItem.streetType,
    streetName: appItem.streetName,
    houseNumber: appItem.houseNumber,
    blockNumber: appItem.blockNumber,
    unitNumber: appItem.unitNumber,
  });

  const newAddress: Address = {
    id: `addr-${Date.now()}`,
    geocode: appItem.assignedGeocode || generateGeocode(appItem.region, appItem.district, db.getAddresses().length + 1),
    cadastreNumber: appItem.cadastreNumber,
    region: appItem.region,
    district: appItem.district,
    postalCode: appItem.postalCode,
    planningStructureType: appItem.planningStructureType,
    planningStructureName: appItem.planningStructureName,
    streetType: appItem.streetType,
    streetName: appItem.streetName,
    houseNumber: appItem.houseNumber,
    blockNumber: appItem.blockNumber,
    unitNumber: appItem.unitNumber,
    fullAddressUz: formatted.uz,
    fullAddressUzCyrillic: formatted.uzCyrillic,
    fullAddressRu: formatted.ru,
    objectType: appItem.objectType,
    lat: appItem.lat,
    lng: appItem.lng,
    boundaryPolygon: appItem.boundaryPolygon,
    entrancePoints: appItem.entrancePoints,
    connectingLine: appItem.connectingLine,
    status: 'active',
    legalGrounds: `Ariza ${appItem.applicationNumber} asosida`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: actorName,
    history: [
      {
        timestamp: new Date().toISOString(),
        action: 'C-01 reglamenti asosida ro\'yxatga olindi',
        changedBy: actorName,
        role: 'SYSTEM',
        details: `Ariza raqami: ${appItem.applicationNumber}`,
      },
    ],
  };

  db.saveAddress(newAddress);
  appItem.registeredAddressId = newAddress.id;

  appItem.timeline.push({
    stage: 'COMPLETED',
    timestamp: new Date().toISOString(),
    actorName,
    actorRole: 'SYSTEM',
    comment: `Manzil muvaffaqiyatli ro'yxatga olindi. Unikal geokod: ${newAddress.geocode}`,
  });

  db.saveApplication(appItem);
}

// ==========================================================
// 4. MANZILNI O'CHIRISH (C-02 WORKFLOW)
// ==========================================================

// List cancellation requests
app.get('/api/cancellations', (req: Request, res: Response) => {
  res.json({ success: true, cancellations: db.getCancellations() });
});

// Filial DKP MM: Submit cancellation proposal
app.post('/api/cancellations', (req: Request, res: Response) => {
  const { addressId, reason, legalDocumentNumber, legalDocumentDate, actorName } = req.body;
  const addr = db.getAddressById(addressId);
  if (!addr) return res.status(404).json({ success: false, message: 'Manzil topilmadi' });

  const reqNum = `CAN-${new Date().getFullYear()}-${String(db.getCancellations().length + 51).padStart(5, '0')}`;

  const cancellation: CancellationRequestC02 = {
    id: `can-${Date.now()}`,
    requestNumber: reqNum,
    addressId: addr.id,
    geocode: addr.geocode,
    fullAddress: addr.fullAddressUz,
    cadastreNumber: addr.cadastreNumber,
    reason,
    legalDocumentNumber,
    legalDocumentDate,
    stage: 'FILIAL_SUBMITTED',
    timeline: [
      {
        stage: 'FILIAL_SUBMITTED',
        timestamp: new Date().toISOString(),
        actorName: actorName || 'Bo\'riyev Komiljon (Filial MM)',
        actorRole: 'FILIAL_DKP_MM',
        comment: `Manzilni o'chirish taklifi kiritildi. Asos: ${legalDocumentNumber}`,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveCancellation(cancellation);

  db.addAuditLog({
    category: 'DATA_OPERATION',
    action: 'Manzilni o\'chirish taklifi kiritildi (C-02)',
    userName: actorName || 'Filial MM',
    userRole: 'FILIAL_DKP_MM',
    ip: getClientIp(req),
    details: `So'rov: ${reqNum}, Geokod: ${addr.geocode}`,
    status: 'SUCCESS',
  });

  res.status(201).json({ success: true, cancellation });
});

// Filial Head forwards cancellation to Region
app.post('/api/cancellations/:id/filial-head-action', (req: Request, res: Response) => {
  const can = db.getCancellationById(req.params.id);
  if (!can) return res.status(404).json({ success: false, message: 'So\'rov topilmadi' });

  const { action, comment, actorName } = req.body;
  if (action === 'reject') {
    can.stage = 'REJECTED';
    can.rejectionReason = comment || 'Filial rahbari tomonidan rad etildi';
  } else {
    can.stage = 'REGION_AGREEMENT';
  }

  can.timeline.push({
    stage: can.stage,
    timestamp: new Date().toISOString(),
    actorName: actorName || 'Filial rahbari DKP',
    actorRole: 'FILIAL_RAHBARI_DKP',
    comment: comment || 'O\'chirish taklifi ko\'rib chiqildi va Hudud DKP MM ga yuborildi',
  });
  can.updatedAt = new Date().toISOString();
  db.saveCancellation(can);

  res.json({ success: true, cancellation: can });
});

// Region agrees cancellation and forwards to Republic
app.post('/api/cancellations/:id/region-agreement', (req: Request, res: Response) => {
  const can = db.getCancellationById(req.params.id);
  if (!can) return res.status(404).json({ success: false, message: 'So\'rov topilmadi' });

  const { action, comment, actorName } = req.body;
  if (action === 'reject') {
    can.stage = 'REJECTED';
    can.rejectionReason = comment || 'Rad etildi';
  } else {
    can.stage = 'REPUBLIC_APPROVAL';
  }

  can.timeline.push({
    stage: can.stage,
    timestamp: new Date().toISOString(),
    actorName: actorName || 'Hudud DKP MM',
    actorRole: 'HUDUD_DKP_MM',
    comment: comment || 'Hududiy boshqarma tomonidan kelishildi va Respublika DKP MM ga yuborildi',
  });
  can.updatedAt = new Date().toISOString();
  db.saveCancellation(can);

  res.json({ success: true, cancellation: can });
});

// Republic final approval for cancellation -> marks address cancelled
app.post('/api/cancellations/:id/republic-approval', (req: Request, res: Response) => {
  const can = db.getCancellationById(req.params.id);
  if (!can) return res.status(404).json({ success: false, message: 'So\'rov topilmadi' });

  const { action, comment, actorName } = req.body;
  if (action === 'reject') {
    can.stage = 'REJECTED';
    can.rejectionReason = comment || 'Rad etildi';
  } else {
    can.stage = 'COMPLETED';
    // Update address in database
    const addr = db.getAddressById(can.addressId);
    if (addr) {
      addr.status = 'cancelled';
      addr.statusReason = can.reason;
      addr.updatedAt = new Date().toISOString();
      if (!addr.history) addr.history = [];
      addr.history.push({
        timestamp: new Date().toISOString(),
        action: 'C-02 tartibida bekor qilindi (o\'chirildi)',
        changedBy: actorName || 'Respublika DKP MM',
        role: 'RESPUBLIKA_DKP_MM',
        details: `So'rov № ${can.requestNumber}, Asos: ${can.legalDocumentNumber}`,
      });
      db.saveAddress(addr);
    }
  }

  can.timeline.push({
    stage: can.stage,
    timestamp: new Date().toISOString(),
    actorName: actorName || 'Respublika DKP MM',
    actorRole: 'RESPUBLIKA_DKP_MM',
    comment: comment || 'Manzilni o\'chirish Respublika palatasi tomonidan tasdiqlandi va reestrdan chiqarildi',
  });
  can.updatedAt = new Date().toISOString();
  db.saveCancellation(can);

  db.addAuditLog({
    category: 'DATA_OPERATION',
    action: 'Manzil reestrdan o\'chirildi (C-02)',
    userName: actorName || 'Respublika DKP MM',
    userRole: 'RESPUBLIKA_DKP_MM',
    ip: getClientIp(req),
    details: `Manzil ID: ${can.addressId}, Geokod: ${can.geocode}`,
    status: 'SUCCESS',
  });

  res.json({ success: true, cancellation: can });
});

// ==========================================================
// 5. UZKAD AVTOMATIK O'CHIRISH (C-03 WORKFLOW INTEGRATION)
// ==========================================================

app.get('/api/integrations/uzkad-events', (req: Request, res: Response) => {
  res.json({ success: true, events: db.getUzkadEvents() });
});

// Webhook endpoint called by UZKAD system when property is demolished/removed
app.post('/api/integrations/uzkad/webhook', (req: Request, res: Response) => {
  const { cadastreNumber, objectDeletionType, documentBasis } = req.body;

  if (!cadastreNumber) {
    return res.status(400).json({ success: false, message: 'cadastreNumber talab qilinadi' });
  }

  // Find address by cadastre number
  const addr = db.getAddresses().find(a => a.cadastreNumber === cadastreNumber);

  const event: UzkadWebhookEventC03 = {
    id: `uzkad-evt-${Date.now()}`,
    eventId: `UZKAD-EVT-${Math.floor(1000 + Math.random() * 9000)}`,
    cadastreNumber,
    objectDeletionType: objectDeletionType || 'DEMOLISHED',
    documentBasis: documentBasis || 'UZKAD elektron dalolatnomasi',
    notifiedAt: new Date().toISOString(),
    processed: true,
    processedAt: new Date().toISOString(),
    targetAddressId: addr ? addr.id : undefined,
    targetGeocode: addr ? addr.geocode : undefined,
    actionTaken: addr
      ? `Manzil avtomatik tarzda bekor qilindi va arxivga o'tkazildi (C-03)`
      : `UZKAD xabarnomasi qabul qilindi, biroq mos manzil topilmadi`,
  };

  if (addr) {
    addr.status = 'cancelled';
    addr.statusReason = `UZKAD avtomatik o'chirish: ${objectDeletionType || 'Buzilgan'}`;
    addr.updatedAt = new Date().toISOString();
    if (!addr.history) addr.history = [];
    addr.history.push({
      timestamp: new Date().toISOString(),
      action: 'UZKAD C-03 orqali avtomatik bekor qilindi',
      changedBy: 'UZKAD Integratsion Shlyuz',
      role: 'SYSTEM',
      details: `Hujjat: ${event.documentBasis}`,
    });
    db.saveAddress(addr);
  }

  db.saveUzkadEvent(event);

  db.addAuditLog({
    category: 'SYSTEM',
    action: 'UZKAD C-03 xabarnomasi qabul qilindi va avtomatik qayta ishlandi',
    userName: 'UZKAD Integration Gateway',
    ip: getClientIp(req),
    details: `Kadastr: ${cadastreNumber}, Obyekt: ${event.targetGeocode || 'Topilmadi'}`,
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    message: 'UZKAD xabarnomasi qabul qilindi va 5 minutdan kamroq vaqtda (avtomatik) qayta ishlandi (TTZ 4.1.1.3 C-03)',
    event,
  });
});

// ==========================================================
// 6. INTEGRATSIYALAR MONITORINGI (TTZ 4.2.13, 4.2.21)
// ==========================================================

app.get('/api/integrations/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    integrations: [
      {
        id: 'oneid',
        name: 'Yagona identifikatsiya tizimi (OneID)',
        protocol: 'REST / OAuth 2.0',
        status: 'ONLINE',
        latencyMs: 42,
        lastSync: new Date().toISOString(),
        description: 'Foydalanuvchilarni autentifikatsiya va JSHSHIR orqali aniqlash',
      },
      {
        id: 'uzkad',
        name: 'Ko\'chmas mulk kadastri axborot tizimi (UZKAD)',
        protocol: 'REST / JSON Webhook',
        status: 'ONLINE',
        latencyMs: 78,
        lastSync: new Date().toISOString(),
        description: 'Obyekt chegaralari, kadastr raqami va C-03 avtomatik o\'chirish',
      },
      {
        id: 'geonames',
        name: 'Geografik obyektlar nomlari davlat reestri (Geonames)',
        protocol: 'REST / JSON API',
        status: 'ONLINE',
        latencyMs: 55,
        lastSync: new Date().toISOString(),
        description: 'Ko\'chalar, maydonlar, massivlar va mavzelar standart nomlari',
      },
      {
        id: 'postal',
        name: 'Raqamli texnologiyalar vazirligi (Pochta indekslari)',
        protocol: 'REST / JSON',
        status: 'ONLINE',
        latencyMs: 64,
        lastSync: new Date().toISOString(),
        description: 'Pochta indekslari chegaralari va 6 xonali indekslar bazasi',
      },
      {
        id: 'msk',
        name: 'Markaziy saylov komissiyasi (MSK)',
        protocol: 'REST / SSL',
        status: 'ONLINE',
        latencyMs: 92,
        lastSync: new Date().toISOString(),
        description: 'Saylov uchastkalari va fuqarolar manzillari integratsiyasi',
      },
      {
        id: 'mygov',
        name: 'Yagona interaktiv davlat xizmatlari portali (MyGov / YIDXP)',
        protocol: 'REST / JSON Gateway',
        status: 'ONLINE',
        latencyMs: 49,
        lastSync: new Date().toISOString(),
        description: 'Elektron ariza qabul qilish va ma\'lumotnoma berish',
      },
    ],
  });
});

// Geonames lookup endpoint
app.get('/api/integrations/geonames/streets', (req: Request, res: Response) => {
  const { query, district } = req.query as Record<string, string>;
  const sampleStreets = [
    { name: 'Cho\'ponota ko\'chasi', type: 'kocha', district: 'Chilonzor tumani', postalCode: '100097' },
    { name: 'Chilonzor ko\'chasi', type: 'kocha', district: 'Chilonzor tumani', postalCode: '100115' },
    { name: 'Lutfiy ko\'chasi', type: 'kocha', district: 'Chilonzor tumani', postalCode: '100097' },
    { name: 'Qatortol ko\'chasi', type: 'kocha', district: 'Chilonzor tumani', postalCode: '100115' },
    { name: 'Bunyodkor shoh ko\'chasi', type: 'shoh_kocha', district: 'Chilonzor tumani', postalCode: '100097' },
    { name: 'Muqimiy ko\'chasi', type: 'kocha', district: 'Chilonzor tumani', postalCode: '100096' },
    { name: 'Shota Rustaveli shoh ko\'chasi', type: 'shoh_kocha', district: 'Yakkasaroy tumani', postalCode: '100100' },
    { name: 'Bobur ko\'chasi', type: 'kocha', district: 'Yakkasaroy tumani', postalCode: '100100' },
    { name: 'Amir Temur shoh ko\'chasi', type: 'shoh_kocha', district: 'Yunusobod tumani', postalCode: '100084' },
    { name: 'Mustaqillik shoh ko\'chasi', type: 'shoh_kocha', district: 'Mirzo Ulug\'bek tumani', postalCode: '100000' },
    { name: 'Registon ko\'chasi', type: 'kocha', district: 'Samarqand shahri', postalCode: '140100' },
    { name: 'Naqshband ko\'chasi', type: 'kocha', district: 'Buxoro shahri', postalCode: '200100' },
  ];

  let filtered = sampleStreets;
  if (district && district !== 'all') {
    filtered = filtered.filter(s => s.district === district);
  }
  if (query && query.trim()) {
    filtered = filtered.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
  }

  res.json({ success: true, streets: filtered });
});

// UZKAD parcel boundary mock lookup
app.get('/api/integrations/uzkad/parcel-lookup', (req: Request, res: Response) => {
  const { cadastreNumber } = req.query as { cadastreNumber: string };
  res.json({
    success: true,
    cadastreNumber: cadastreNumber || '10:04:02:01:01:0024',
    ownerName: 'O\'zbekiston Respublikasi Davlat mulki',
    ownerType: 'LEGAL',
    pinflOrStir: '202584102',
    areaHa: 0.42,
    propertyType: 'noturar',
    boundaryPolygon: [
      [41.2861, 69.2032],
      [41.2862, 69.2041],
      [41.2855, 69.2042],
      [41.2854, 69.2033],
    ],
  });
});

// ==========================================================
// 7. AUDIT LOGLAR (TTZ 4.2.18 - 7 TOIFA)
// ==========================================================

app.get('/api/audit-logs', (req: Request, res: Response) => {
  const { category, status, query } = req.query as Record<string, string>;
  let logs = db.getAuditLogs();

  if (category && category !== 'all') {
    logs = logs.filter(l => l.category === category);
  }
  if (status && status !== 'all') {
    logs = logs.filter(l => l.status === status);
  }
  if (query && query.trim()) {
    const term = query.toLowerCase();
    logs = logs.filter(
      l =>
        l.action.toLowerCase().includes(term) ||
        l.userName.toLowerCase().includes(term) ||
        l.details.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, count: logs.length, logs: logs.slice(0, 100) });
});

// ==========================================================
// 8. MONITORING VA STATISTIKA (TTZ 4.2.5 DASHBOARD)
// ==========================================================

app.get('/api/stats', (req: Request, res: Response) => {
  const addresses = db.getAddresses();
  const applications = db.getApplications();
  const cancellations = db.getCancellations();

  const totalAddresses = addresses.length;
  const activeAddresses = addresses.filter(a => a.status === 'active').length;
  const cancelledAddresses = addresses.filter(a => a.status === 'cancelled').length;

  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.stage !== 'APPROVED' && a.stage !== 'REJECTED').length;

  // Regional distribution
  const regionMap: Record<string, number> = {};
  addresses.forEach(a => {
    regionMap[a.region] = (regionMap[a.region] || 0) + 1;
  });

  // Stage distribution
  const stageMap: Record<string, number> = {};
  applications.forEach(a => {
    stageMap[a.stage] = (stageMap[a.stage] || 0) + 1;
  });

  res.json({
    success: true,
    summary: {
      totalAddresses,
      activeAddresses,
      cancelledAddresses,
      totalApplications,
      pendingApplications,
      cancellationsCount: cancellations.length,
      auditLogsCount: db.getAuditLogs().length,
      systemUptimePercent: 99.98,
      responseTimeMs: 38,
    },
    byRegion: regionMap,
    byStage: stageMap,
  });
});

// ==========================================================
// 9. FOYDALANUVCHILAR VA ROLLAR (TTZ 4.2.15, 4.2.17 RBAC)
// ==========================================================

app.get('/api/users', (req: Request, res: Response) => {
  res.json({ success: true, users: db.getUsers() });
});

app.post('/api/users', (req: Request, res: Response) => {
  const body = req.body;
  const newUser: User = {
    id: `user-${Date.now()}`,
    pinfl: body.pinfl || '30000000000000',
    fullName: body.fullName || 'Yangi xodim',
    email: body.email || `user_${Date.now()}@kadastr.uz`,
    phone: body.phone || '+998 90 000-00-00',
    role: body.role || 'FILIAL_DKP_MM',
    region: body.region || 'Toshkent shahri',
    district: body.district || 'Chilonzor tumani',
    department: body.department || 'Filial',
    isActive: true,
    termsAccepted: true,
    createdAt: new Date().toISOString(),
  };

  db.saveUser(newUser);

  db.addAuditLog({
    category: 'ADMIN_ACTION',
    action: 'Yangi foydalanuvchi hisobi yaratildi',
    userName: 'Administrator',
    ip: getClientIp(req),
    details: `Foydalanuvchi: ${newUser.fullName}, Rol: ${newUser.role}`,
    status: 'SUCCESS',
  });

  res.status(201).json({ success: true, user: newUser });
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

  Object.assign(user, req.body);
  db.saveUser(user);

  db.addAuditLog({
    category: 'ADMIN_ACTION',
    action: 'Foydalanuvchi parametrlari o\'zgartirildi',
    userName: 'Administrator',
    ip: getClientIp(req),
    details: `Foydalanuvchi: ${user.fullName}, Rol: ${user.role}`,
    status: 'SUCCESS',
  });

  res.json({ success: true, user });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const deleted = db.deleteUser(req.params.id);
  res.json({ success: deleted });
});

// ==========================================================
// 10. SOZLAMALAR (TTZ 4.2.6)
// ==========================================================

app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ success: true, settings: db.getSettings() });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = db.saveSettings(req.body);
  db.addAuditLog({
    category: 'ADMIN_ACTION',
    action: 'Tizim konfiguratsiyasi yangilandi',
    userName: 'Administrator',
    ip: getClientIp(req),
    details: `Maksimal bog'lovchi masofa: ${updated.maxConnectingLineMeters}m`,
    status: 'SUCCESS',
  });
  res.json({ success: true, settings: updated });
});

// ==========================================================
// 11. ZAXIRA NUSXALASH VA TIKLASH (BACKUP & RESTORE TTZ 4.2.19)
// ==========================================================

app.get('/api/backup/export', (req: Request, res: Response) => {
  const dump = db.exportBackup();
  res.setHeader('Content-Disposition', `attachment; filename=manzillar_backup_${Date.now()}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.json(dump);
});

app.post('/api/backup/import', (req: Request, res: Response) => {
  const success = db.importBackup(req.body);
  if (success) {
    db.addAuditLog({
      category: 'DATA_OPERATION',
      action: 'Tizim zaxira nusxadan qayta tiklandi',
      userName: 'Administrator',
      ip: getClientIp(req),
      details: 'Ma\'lumotlar bazasi zaxira faylidan muvaffaqiyatli import qilindi',
      status: 'SUCCESS',
    });
    return res.json({ success: true, message: 'Ma\'lumotlar muvaffaqiyatli tiklandi' });
  }
  res.status(400).json({ success: false, message: 'Zaxira fayli yaroqsiz' });
});

// ==========================================================
// 12. TEXNIK KO'MAK (SUPPORT TICKETS TTZ 4.2.23)
// ==========================================================

app.get('/api/tickets', (req: Request, res: Response) => {
  res.json({ success: true, tickets: db.getTickets() });
});

app.post('/api/tickets', (req: Request, res: Response) => {
  const body = req.body;
  const num = `TKT-${new Date().getFullYear()}-${String(db.getTickets().length + 13).padStart(4, '0')}`;
  const newTicket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: num,
    userId: body.userId || 'user-unknown',
    userName: body.userName || 'Foydalanuvchi',
    userEmail: body.userEmail || 'user@kadastr.uz',
    category: body.category || 'BOSHQA',
    subject: body.subject,
    message: body.message,
    priority: body.priority || 'ORTA',
    status: 'OPEN',
    replies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveTicket(newTicket);
  res.status(201).json({ success: true, ticket: newTicket });
});

app.post('/api/tickets/:id/reply', (req: Request, res: Response) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Murojaat topilmadi' });

  const { senderName, isStaff, message, newStatus } = req.body;
  ticket.replies.push({
    id: `rep-${Date.now()}`,
    senderName: senderName || 'Operator',
    isStaff: isStaff || false,
    message,
    timestamp: new Date().toISOString(),
  });
  if (newStatus) ticket.status = newStatus;
  ticket.updatedAt = new Date().toISOString();

  db.saveTicket(ticket);
  res.json({ success: true, ticket });
});

// Serve client build if available
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`MANZILLAR REESTRI AT SERVERI ISHGA TUSHDI!`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Vaqt: ${new Date().toISOString()}`);
  console.log(`====================================================`);
});
