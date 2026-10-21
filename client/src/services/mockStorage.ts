import mockDbData from '../data/mockDb.json';

interface DatabaseSchema {
  users: any[];
  addresses: any[];
  applications: any[];
  cancellations: any[];
  uzkadEvents: any[];
  auditLogs: any[];
  settings: any;
  tickets: any[];
}

const STORAGE_KEY = 'manzil_mock_db';

function getDb(): DatabaseSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
  }
  return mockDbData as unknown as DatabaseSchema;
}

function saveDb(db: DatabaseSchema) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
}

export function handleMockRequest(url: string, options?: RequestInit): any {
  const db = getDb();
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : {};
  const [pathname, queryString] = url.split('?');
  const searchParams = new URLSearchParams(queryString || '');

  // 1. Auth
  if (pathname === '/auth/login') {
    const identifier = body.identifier;
    const user = db.users.find((u: any) => u.email === identifier || u.pinfl === identifier) || db.users[0];
    return { success: true, token: 'mock-token-' + Date.now(), user };
  }

  if (pathname === '/auth/oneid') {
    let user = db.users.find((u: any) => u.pinfl === body.pinfl);
    if (!user) {
      user = {
        id: 'user-' + Date.now(),
        pinfl: body.pinfl,
        fullName: body.fullName,
        email: body.email || 'citizen@oneid.uz',
        phone: body.phone || '+998 90 000-00-00',
        role: 'CITIZEN',
        region: 'Toshkent shahri',
        district: 'Chilonzor tumani',
        department: 'Jismoniy shaxs',
        isActive: true,
        termsAccepted: false,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDb(db);
    }
    return { success: true, token: 'mock-token-' + Date.now(), user };
  }

  if (pathname === '/auth/switch-role') {
    const user = db.users.find((u: any) => u.role === body.role) || {
      id: 'user-' + body.role.toLowerCase(),
      pinfl: '30000000000000',
      fullName: 'Tizim foydalanuvchisi (' + body.role + ')',
      email: 'user@kadastr.uz',
      phone: '+998 71 202-00-00',
      role: body.role,
      region: 'Toshkent shahri',
      district: 'Chilonzor tumani',
      department: 'Kadastr bo\'limi',
      isActive: true,
      termsAccepted: true,
      createdAt: new Date().toISOString(),
    };
    return { success: true, token: 'mock-token-' + Date.now(), user };
  }

  if (pathname === '/auth/accept-terms') {
    const user = db.users.find((u: any) => u.id === body.userId);
    if (user) {
      user.termsAccepted = true;
      saveDb(db);
    }
    return { success: true, user };
  }

  // 2. Stats
  if (pathname === '/stats') {
    const total = db.addresses.length;
    const active = db.addresses.filter((a: any) => a.status === 'active').length;
    const cancelled = db.addresses.filter((a: any) => a.status === 'cancelled').length;
    const byRegion: Record<string, number> = {};
    db.addresses.forEach((a: any) => {
      byRegion[a.region] = (byRegion[a.region] || 0) + 1;
    });
    const byStage: Record<string, number> = {};
    db.applications.forEach((app: any) => {
      byStage[app.stage] = (byStage[app.stage] || 0) + 1;
    });

    return {
      success: true,
      summary: {
        totalAddresses: total,
        activeAddresses: active,
        cancelledAddresses: cancelled,
        totalApplications: db.applications.length,
        pendingApplications: db.applications.filter((a: any) => a.stage !== 'APPROVED' && a.stage !== 'REJECTED').length,
        cancellationsCount: db.cancellations.length,
        auditLogsCount: db.auditLogs.length,
        systemUptimePercent: 99.98,
        responseTimeMs: 42,
      },
      byRegion,
      byStage,
    };
  }

  // 3. Addresses
  if (pathname === '/addresses' && method === 'GET') {
    let list = [...db.addresses];
    const q = searchParams.get('q');
    const cadastreNumber = searchParams.get('cadastreNumber');
    const region = searchParams.get('region');
    const district = searchParams.get('district');
    const mahalla = searchParams.get('mahalla');
    const streetName = searchParams.get('streetName');
    const houseNumber = searchParams.get('houseNumber');
    const usageType = searchParams.get('usageType');
    const status = searchParams.get('status');
    const objectType = searchParams.get('objectType');

    if (q) {
      const qLow = q.toLowerCase();
      list = list.filter(
        (a: any) =>
          (a.fullAddressUz && a.fullAddressUz.toLowerCase().includes(qLow)) ||
          (a.geocode && a.geocode.toLowerCase().includes(qLow)) ||
          (a.cadastreNumber && a.cadastreNumber.toLowerCase().includes(qLow))
      );
    }
    if (cadastreNumber) {
      list = list.filter((a: any) => a.cadastreNumber && a.cadastreNumber.toLowerCase().includes(cadastreNumber.toLowerCase()));
    }
    if (region && region !== 'all') list = list.filter((a: any) => a.region === region);
    if (district && district !== 'all') list = list.filter((a: any) => a.district === district);
    if (mahalla && mahalla !== 'all') list = list.filter((a: any) => a.mahalla && a.mahalla.toLowerCase().includes(mahalla.toLowerCase()));
    if (streetName && streetName !== 'all') list = list.filter((a: any) => a.streetName && a.streetName.toLowerCase().includes(streetName.toLowerCase()));
    if (houseNumber) list = list.filter((a: any) => a.houseNumber && a.houseNumber.toLowerCase().includes(houseNumber.toLowerCase()));
    if (usageType && usageType !== 'all') list = list.filter((a: any) => a.usageType === usageType || a.objectType === usageType);
    if (status && status !== 'all') list = list.filter((a: any) => a.status === status);
    if (objectType && objectType !== 'all') list = list.filter((a: any) => a.objectType === objectType);

    return { success: true, count: list.length, addresses: list };
  }

  const addrMatch = pathname.match(/^\/addresses\/([^\/]+)$/);
  if (addrMatch) {
    const id = addrMatch[1];
    if (method === 'GET') {
      const address = db.addresses.find((a: any) => a.id === id);
      return { success: !!address, address };
    }
    if (method === 'PUT') {
      const idx = db.addresses.findIndex((a: any) => a.id === id);
      if (idx !== -1) {
        db.addresses[idx] = { ...db.addresses[idx], ...body, updatedAt: new Date().toISOString() };
        saveDb(db);
        return { success: true, address: db.addresses[idx] };
      }
    }
  }

  const certMatch = pathname.match(/^\/addresses\/([^\/]+)\/certificate$/);
  if (certMatch) {
    const id = certMatch[1];
    const address = db.addresses.find((a: any) => a.id === id) || db.addresses[0];
    const cert = {
      certificateNumber: 'MR-' + Math.floor(100000 + Math.random() * 900000),
      issuedDate: new Date().toISOString(),
      cadastreAgency: 'O\'zbekiston Respublikasi Iqtisodiyot va moliya vazirligi huzuridagi Kadastr agentligi',
      registryName: 'Ko\'chmas mulk obyektlari manzillari reestri axborot tizimi',
      address,
      qrPayload: `https://manzil.kadastr.uz/verify/${address?.geocode || 'UZ-001'}`,
      digitalSignatureHash: 'E-IMZO-SHA256:7fa89c02d8471e9a3b6f',
      verificationUrl: `https://manzil.kadastr.uz/verify/${address?.geocode || 'UZ-001'}`,
    };
    return { success: true, certificate: cert };
  }

  if (pathname === '/addresses' && method === 'POST') {
    const newAddr: any = {
      id: 'addr-' + Date.now(),
      geocode: 'UZ-TAS-' + Math.floor(10000 + Math.random() * 90000),
      region: body.region || 'Toshkent shahri',
      district: body.district || 'Chilonzor tumani',
      streetType: body.streetType || 'kocha',
      streetName: body.streetName || 'Nomlanmagan ko\'cha',
      houseNumber: body.houseNumber || '1-uy',
      postalCode: body.postalCode || '100096',
      fullAddressUz: body.fullAddressUz || `${body.region || 'Toshkent shahri'}, ${body.district || 'Chilonzor tumani'}, ${body.streetName || 'Ko\'cha'}`,
      fullAddressUzCyrillic: body.fullAddressUzCyrillic || `${body.region || 'Тошкент шаҳри'}, ${body.district || 'Чилонзор тумани'}, ${body.streetName || 'Кўча'}`,
      fullAddressRu: body.fullAddressRu || `${body.region || 'г. Ташкент'}, ${body.district || 'Чиланзарский район'}, ${body.streetName || 'улица'}`,
      cadastreNumber: body.cadastreNumber || '10:04:01:02:01:0999',
      lat: body.lat || 41.2858,
      lng: body.lng || 69.2035,
      entrancePoints: body.entrancePoints || [],
      objectType: body.objectType || 'turar_joy',
      status: 'active',
      createdBy: 'Tizim foydalanuvchisi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.addresses.unshift(newAddr);
    saveDb(db);
    return { success: true, address: newAddr };
  }

  // 4. Applications (C-01)
  if (pathname === '/applications' && method === 'GET') {
    let list = [...db.applications];
    const stage = searchParams.get('stage');
    if (stage) list = list.filter((a: any) => a.stage === stage);
    return { success: true, count: list.length, applications: list };
  }

  const appMatch = pathname.match(/^\/applications\/([^\/]+)$/);
  if (appMatch && method === 'GET') {
    const application = db.applications.find((a: any) => a.id === appMatch[1]);
    return { success: !!application, application };
  }

  if (pathname === '/applications' && method === 'POST') {
    const newApp: any = {
      id: 'app-' + Date.now(),
      applicationNumber: 'APP-2026-' + Math.floor(1000 + Math.random() * 9000),
      source: body.source || 'CITIZEN_PORTAL',
      applicantType: body.applicantType || 'INDIVIDUAL',
      applicantPinflOrStir: body.applicantPinflOrStir || '30000000000000',
      applicantName: body.applicantName || 'Ariza Beruvchi',
      applicantPhone: body.applicantPhone || '+998 90 123-45-67',
      cadastreNumber: body.cadastreNumber || '10:01:01:01:01:0001',
      region: body.region || 'Toshkent shahri',
      district: body.district || 'Chilonzor tumani',
      postalCode: body.postalCode || '100096',
      streetType: body.streetType || 'kocha',
      streetName: body.streetName || 'Muqimiy ko\'chasi',
      houseNumber: body.houseNumber || '1',
      objectType: body.objectType || 'turar_joy',
      lat: body.lat || 41.2858,
      lng: body.lng || 69.2035,
      entrancePoints: body.entrancePoints || [],
      isPaidService: true,
      isPaid: false,
      invoiceAmountUzs: 68000,
      stage: 'FILIAL_REVIEW',
      timeline: [
        {
          stage: 'CITIZEN_SUBMITTED',
          timestamp: new Date().toISOString(),
          actorName: body.applicantName || 'Ariza Beruvchi',
          actorRole: 'Ariza beruvchi',
          comment: 'Ariza yaratildi va filialga yuborildi',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.applications.unshift(newApp);
    saveDb(db);
    return { success: true, application: newApp };
  }

  const actMatch = pathname.match(/^\/applications\/([^\/]+)\/(filial-review|filial-head-action|region-agreement|republic-approval|pay-invoice)$/);
  if (actMatch && method === 'POST') {
    const [, appId, actionType] = actMatch;
    const app = db.applications.find((a: any) => a.id === appId);
    if (app) {
      if (actionType === 'filial-review') {
        app.stage = 'FILIAL_HEAD_REVIEW';
        app.timeline.push({
          stage: 'FILIAL_HEAD_REVIEW',
          timestamp: new Date().toISOString(),
          actorName: 'Filial mutaxassisi',
          actorRole: 'FILIAL_DKP_MM',
          comment: body.comment || 'Filial mutaxassisi ko\'rib chiqdi va rahbar tasdig\'iga yo\'lladi',
        });
      } else if (actionType === 'filial-head-action') {
        if (body.action === 'approve') {
          app.stage = 'REGION_AGREEMENT';
        } else if (body.action === 'reject') {
          app.stage = 'REJECTED';
        }
        app.timeline.push({
          stage: app.stage,
          timestamp: new Date().toISOString(),
          actorName: body.actorName || 'Filial rahbari',
          actorRole: 'FILIAL_RAHBARI_DKP',
          comment: body.comment || 'Filial rahbari qarori',
        });
      } else if (actionType === 'region-agreement') {
        app.stage = body.action === 'agree' ? 'REPUBLIC_APPROVAL' : 'FILIAL_REVIEW';
        app.timeline.push({
          stage: app.stage,
          timestamp: new Date().toISOString(),
          actorName: body.actorName || 'Hudud mutaxassisi',
          actorRole: 'HUDUD_DKP_MM',
          comment: body.comment || 'Viloyat DKP MM kelishuvi',
        });
      } else if (actionType === 'republic-approval') {
        app.stage = body.action === 'approve' ? 'APPROVED' : 'FILIAL_REVIEW';
        app.timeline.push({
          stage: app.stage,
          timestamp: new Date().toISOString(),
          actorName: body.actorName || 'Respublika mutaxassisi',
          actorRole: 'RESPUBLIKA_DKP_MM',
          comment: body.comment || 'Respublika DKP MM tasdig\'i',
        });
      } else if (actionType === 'pay-invoice') {
        app.isPaid = true;
      }
      app.updatedAt = new Date().toISOString();
      saveDb(db);
      return { success: true, application: app };
    }
  }

  // 5. Cancellations (C-02)
  if (pathname === '/cancellations' && method === 'GET') {
    return { success: true, cancellations: db.cancellations };
  }

  if (pathname === '/cancellations' && method === 'POST') {
    const newCan: any = {
      id: 'can-' + Date.now(),
      requestNumber: 'CAN-2026-' + Math.floor(100 + Math.random() * 900),
      addressId: body.addressId || 'addr-1',
      geocode: body.geocode || 'UZ-TAS-00123',
      fullAddress: body.fullAddress || 'Toshkent shahri, Chilonzor tumani, Muqimiy ko\'chasi, 12-uy',
      cadastreNumber: body.cadastreNumber || '10:04:01:02:01:0123',
      reason: body.reason || 'Obyekt buzilgan va qayta qurilish rejalashtirilgan',
      legalDocumentNumber: body.legalDocumentNumber || 'Q-2026/112',
      legalDocumentDate: body.legalDocumentDate || new Date().toISOString().split('T')[0],
      stage: 'FILIAL_SUBMITTED',
      timeline: [
        {
          stage: 'FILIAL_SUBMITTED',
          timestamp: new Date().toISOString(),
          actorName: 'Filial MM mutaxassisi',
          actorRole: 'FILIAL_DKP_MM',
          comment: 'O\'chirish bo\'yicha ariza shakllantirildi',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.cancellations.unshift(newCan);
    saveDb(db);
    return { success: true, cancellation: newCan };
  }

  const canActMatch = pathname.match(/^\/cancellations\/([^\/]+)\/(filial-head-action|region-agreement|republic-approval)$/);
  if (canActMatch && method === 'POST') {
    const [, canId, actionType] = canActMatch;
    const can = db.cancellations.find((c: any) => c.id === canId);
    if (can) {
      if (actionType === 'filial-head-action') {
        can.stage = body.action === 'forward' ? 'REGION_AGREEMENT' : 'REJECTED';
      } else if (actionType === 'region-agreement') {
        can.stage = body.action === 'agree' ? 'REPUBLIC_APPROVAL' : 'REJECTED';
      } else if (actionType === 'republic-approval') {
        can.stage = body.action === 'approve' ? 'COMPLETED' : 'REJECTED';
      }
      can.timeline.push({
        stage: can.stage,
        timestamp: new Date().toISOString(),
        actorName: body.actorName || 'Mas\'ul xodim',
        actorRole: 'DKP_MM',
        comment: body.comment || 'Bosqichli qaror qabul qilindi',
      });
      can.updatedAt = new Date().toISOString();
      saveDb(db);
      return { success: true, cancellation: can };
    }
  }

  // 6. Integrations & UZKAD
  if (pathname === '/integrations/status') {
    return {
      success: true,
      integrations: [
        { id: 'uzkad', name: 'UZKAD (Yagona kadastr bazasi)', status: 'online', latencyMs: 28, lastSync: 'Hozir' },
        { id: 'geonames', name: 'Geografik ob\'ektlar reestri', status: 'online', latencyMs: 34, lastSync: 'Hozir' },
        { id: 'oneid', name: 'OneID (Yagona identifikatsiya tizimi)', status: 'online', latencyMs: 19, lastSync: 'Hozir' },
      ],
    };
  }

  if (pathname === '/integrations/uzkad-events') {
    return { success: true, events: db.uzkadEvents || [] };
  }

  if (pathname === '/integrations/uzkad/webhook') {
    const newEvent: any = {
      id: 'evt-' + Date.now(),
      eventId: 'UZKAD-EVT-' + Math.floor(100000 + Math.random() * 900000),
      cadastreNumber: body.cadastreNumber,
      objectDeletionType: body.objectDeletionType,
      documentBasis: body.documentBasis,
      notifiedAt: new Date().toISOString(),
      processed: true,
      actionTaken: 'UZKAD integratsiya orqali manzil avtomatik bekor qilindi',
    };
    if (!db.uzkadEvents) db.uzkadEvents = [];
    db.uzkadEvents.unshift(newEvent);
    saveDb(db);
    return { success: true, message: 'UZKAD Webhook muvaffaqiyatli qabul qilindi', event: newEvent };
  }

  if (pathname === '/integrations/geonames/streets') {
    return {
      success: true,
      streets: [
        { id: 'st-1', nameUz: 'Muqimiy ko\'chasi', code: 'GN-1004-001', district: 'Chilonzor tumani' },
        { id: 'st-2', nameUz: 'Navoiy shoh ko\'chasi', code: 'GN-1001-002', district: 'Shayxontohur tumani' },
        { id: 'st-3', nameUz: 'Amir Temur shoh ko\'chasi', code: 'GN-1002-003', district: 'Yunusobod tumani' },
      ],
    };
  }

  if (pathname === '/integrations/uzkad/parcel-lookup') {
    return {
      success: true,
      boundaryPolygon: [
        [41.2855, 69.2030],
        [41.2862, 69.2031],
        [41.2861, 69.2040],
        [41.2854, 69.2039],
      ],
      ownerName: 'Omonov Sarvar Davronovich',
      pinflOrStir: '32211900040089',
      areaHa: 0.08,
    };
  }

  // 7. Audit logs
  if (pathname === '/audit-logs') {
    return { success: true, count: db.auditLogs.length, logs: db.auditLogs };
  }

  // 8. Users
  if (pathname === '/users') {
    if (method === 'GET') {
      return { success: true, users: db.users };
    }
    if (method === 'POST') {
      const newUser: any = {
        id: 'user-' + Date.now(),
        pinfl: body.pinfl || '30000000000000',
        fullName: body.fullName || 'Yangi xodim',
        email: body.email || 'user@kadastr.uz',
        phone: body.phone || '+998 90 000-00-00',
        role: body.role || 'FILIAL_DKP_MM',
        region: body.region || 'Toshkent shahri',
        district: body.district || 'Chilonzor tumani',
        department: body.department || 'Filial bo\'limi',
        isActive: true,
        termsAccepted: true,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      saveDb(db);
      return { success: true, user: newUser };
    }
  }

  const userMatch = pathname.match(/^\/users\/([^\/]+)$/);
  if (userMatch) {
    const id = userMatch[1];
    if (method === 'PUT') {
      const idx = db.users.findIndex((u: any) => u.id === id);
      if (idx !== -1) {
        db.users[idx] = { ...db.users[idx], ...body };
        saveDb(db);
        return { success: true, user: db.users[idx] };
      }
    }
    if (method === 'DELETE') {
      db.users = db.users.filter((u: any) => u.id !== id);
      saveDb(db);
      return { success: true };
    }
  }

  // 9. Settings
  if (pathname === '/settings') {
    if (method === 'GET') {
      return { success: true, settings: db.settings };
    }
    if (method === 'PUT') {
      db.settings = { ...db.settings, ...body };
      saveDb(db);
      return { success: true, settings: db.settings };
    }
  }

  // 10. Tickets
  if (pathname === '/tickets') {
    if (method === 'GET') {
      return { success: true, tickets: db.tickets };
    }
    if (method === 'POST') {
      const newTicket: any = {
        id: 'tkt-' + Date.now(),
        ticketNumber: 'TKT-2026-' + Math.floor(100 + Math.random() * 900),
        userId: body.userId || 'user-1',
        userName: body.userName || 'Xodim',
        userEmail: body.userEmail || 'xodim@kadastr.uz',
        category: body.category || 'TIZIM_XATOLIGI',
        priority: body.priority || 'ORTA',
        subject: body.subject || 'Murojaat',
        message: body.message || 'Murojaat matni',
        status: 'OPEN',
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.tickets.unshift(newTicket);
      saveDb(db);
      return { success: true, ticket: newTicket };
    }
  }

  const tktMatch = pathname.match(/^\/tickets\/([^\/]+)\/reply$/);
  if (tktMatch && method === 'POST') {
    const tkt = db.tickets.find((t: any) => t.id === tktMatch[1]);
    if (tkt) {
      if (!tkt.replies) tkt.replies = [];
      tkt.replies.push({
        id: 'msg-' + Date.now(),
        senderName: body.senderName,
        isStaff: body.isStaff,
        message: body.message,
        timestamp: new Date().toISOString(),
      });
      if (body.newStatus) tkt.status = body.newStatus;
      tkt.updatedAt = new Date().toISOString();
      saveDb(db);
      return { success: true, ticket: tkt };
    }
  }

  // Default fallback
  return { success: true };
}
