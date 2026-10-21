export type UserRole =
  | 'RESPUBLIKA_DKP_MM'     // Respublika DKP MM (Bosh palata mutaxassisi)
  | 'HUDUD_DKP_MM'          // Hudud DKP MM (Viloyat boshqarma mutaxassisi)
  | 'FILIAL_RAHBARI_DKP'    // Filial rahbari DKP (Tuman/shahar filiali rahbari)
  | 'FILIAL_DKP_MM'         // Filial DKP MM (Tuman/shahar mutaxassisi / ijrochisi)
  | 'ADMIN'                 // Tizim administratori
  | 'INSPECTOR'             // Nazoratchi / mas'ul xodim
  | 'CITIZEN';              // Tinglovchi / Fuqaro (faqat ko'rish)

export interface User {
  id: string;
  pinfl: string;            // JSHSHIR (14 xonali)
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  region: string;
  district: string;
  department?: string;
  isActive: boolean;
  termsAccepted: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type StreetType =
  | 'shoh_kocha'     // Shoh ko'cha (sh.k.)
  | 'kocha'          // Ko'cha (k.)
  | 'xiyobon'        // Xiyobon (xiy.)
  | 'bolak'          // Bo'lak
  | 'otish_joyi'     // O'tish joyi
  | 'maydon'         // Maydon
  | 'sayilgoh'       // Sayilgoh / bulvar
  | 'berk_kocha'     // Berk ko'cha
  | 'chiqish'        // Chiqish
  | 'magistral';     // Magistral

export type PlanningStructureType =
  | 'massiv'         // Zona (massiv)
  | 'mikrorayon'     // Mikrorayon
  | 'mavze'          // Mavze
  | 'turar_joy_massivi'
  | 'ishlab_chiqarish_maydoni'
  | 'qirgoq'
  | 'hudud';

export interface EntrancePoint {
  id: string;
  type: 'main' | 'secondary'; // asosiy kirish yoki ikkilamchi kirish nuqtasi
  lat: number;
  lng: number;
  name?: string;
  isOnBoundary: boolean;      // TTZ talabi: bino/uchastka chegarasi ustida bo'lishi shart
}

export interface ConnectingLine {
  id: string;
  points: [number, number][]; // [lat, lng] array
  lengthMeters: number;       // TTZ talabi: 50 metrdan oshmasligi kerak!
  isValid: boolean;
  targetStreetId?: string;
  targetStreetName?: string;
}

export interface CadastreObjectInfo {
  cadastreNumber: string;     // e.g. "10:04:02:01:01:0024"
  ownerName: string;
  ownerType: 'INDIVIDUAL' | 'LEGAL';
  pinflOrStir: string;
  areaHa: number;
  propertyType: 'turar_joy' | 'noturar' | 'yer_uchastkasi';
  boundaryPolygon: [number, number][];
}

export interface Address {
  id: string;
  geocode: string;            // Unikal geokod (e.g. "UZ-TAS-CHI-2026-004819")
  cadastreNumber: string;     // Bog'langan ko'chmas mulk kadastr raqami
  region: string;             // Viloyat / Hudud nomi
  district: string;           // Tuman / shahar
  postalCode: string;         // 6 xonali pochta indeksi (e.g. "100097")
  planningStructureType?: PlanningStructureType;
  planningStructureName?: string; // Mahalla / Mavze / Daha nomi
  streetType: StreetType;
  streetName: string;
  houseNumber: string;        // Uy raqami
  blockNumber?: string;       // Bino / korpus
  unitNumber?: string;        // Kvartira (xonadon) yoki noturar obyekt raqami
  fullAddressUz: string;      // To'liq manzil matni (Lotin)
  fullAddressUzCyrillic: string; // Кирилча
  fullAddressRu: string;      // Ruscha
  objectType: 'turar_joy' | 'noturar' | 'yer_uchastkasi';
  lat: number;
  lng: number;
  boundaryPolygon?: [number, number][];
  entrancePoints: EntrancePoint[];
  connectingLine?: ConnectingLine;
  status: 'active' | 'cancelled' | 'archived';
  statusReason?: string;
  legalGrounds?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  history?: AddressHistoryItem[];
}

export interface AddressHistoryItem {
  timestamp: string;
  action: string;
  changedBy: string;
  role: string;
  details: string;
  previousValue?: any;
}

export type ApplicationStage =
  | 'FILIAL_REVIEW'          // 1. Filial DKP MM ko'rib chiqmoqda (kirish nuqtasi, bog'lovchi chiziq, avto-manzil)
  | 'FILIAL_HEAD_REVIEW'     // 2. Filial rahbari DKP tekshirmoqda (geokod biriktirish, tasdiqlash)
  | 'REGION_AGREEMENT'       // 3. Hudud DKP MM (agar ko'cha bog'lovchi nuqta/chiziq bo'lsa)
  | 'REPUBLIC_APPROVAL'      // 4. Respublika DKP MM (ko'cha bog'lovchi chiziq bo'lsa yakuniy tasdiq)
  | 'PAYMENT_PENDING'        // 5. Invoys bo'yicha to'lov kutilmoqda
  | 'APPROVED'               // 6. Yakuniy tasdiqlangan va reestrga kiritilgan
  | 'REJECTED';              // Rad etilgan

export interface ApplicationC01 {
  id: string;
  applicationNumber: string; // e.g. "APP-2026-10492"
  source: 'UZKAD' | 'MYGOV' | 'YIDXP' | 'DXM' | 'DIRECT';
  applicantType: 'INDIVIDUAL' | 'LEGAL';
  applicantName: string;
  applicantPinflOrStir: string;
  applicantPhone: string;
  cadastreNumber: string;
  region: string;
  district: string;
  postalCode: string;
  planningStructureType?: PlanningStructureType;
  planningStructureName?: string;
  streetType: StreetType;
  streetName: string;
  houseNumber: string;
  blockNumber?: string;
  unitNumber?: string;
  objectType: 'turar_joy' | 'noturar' | 'yer_uchastkasi';
  lat: number;
  lng: number;
  boundaryPolygon?: [number, number][];
  entrancePoints: EntrancePoint[];
  connectingLine?: ConnectingLine;
  assignedGeocode?: string;
  isPaidService: boolean;
  invoiceNumber?: string;
  invoiceAmountUzs?: number;
  isPaid: boolean;
  stage: ApplicationStage;
  rejectionReason?: string;
  assignedToUser?: string;
  registeredAddressId?: string;
  timeline: {
    stage: ApplicationStage | string;
    timestamp: string;
    actorName: string;
    actorRole: string;
    comment: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type CancellationStage =
  | 'FILIAL_SUBMITTED'       // Filial DKP MM taklif kiritdi
  | 'FILIAL_HEAD_REVIEW'     // Filial rahbari ko'rib chiqmoqda
  | 'REGION_AGREEMENT'       // Hudud DKP MM kelishuvda
  | 'REPUBLIC_APPROVAL'      // Respublika DKP MM tasdiqlamoqda
  | 'COMPLETED'              // Yakunlandi va manzil o'chirildi
  | 'REJECTED';

export interface CancellationRequestC02 {
  id: string;
  requestNumber: string;
  addressId: string;
  geocode: string;
  fullAddress: string;
  cadastreNumber: string;
  reason: string;
  legalDocumentNumber: string;
  legalDocumentDate: string;
  stage: CancellationStage;
  rejectionReason?: string;
  timeline: {
    stage: CancellationStage | string;
    timestamp: string;
    actorName: string;
    actorRole: string;
    comment: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface UzkadWebhookEventC03 {
  id: string;
  eventId: string;
  cadastreNumber: string;
  objectDeletionType: 'DEMOLISHED' | 'MERGED' | 'SUBDIVIDED' | 'COURT_DECISION';
  documentBasis: string;
  notifiedAt: string;
  processed: boolean;
  processedAt?: string;
  targetAddressId?: string;
  targetGeocode?: string;
  actionTaken: string;
}

export type AuditLogCategory =
  | 'AUTH'                   // Аутентификация логлари (кириш/чиқиш)
  | 'AUTHORIZATION'          // Авторизация логлари (рухсат берилди/рад этилди)
  | 'USER_ACTION'            // Фойдаланувчи амаллари (қўшиш, таҳрирлаш, ўчириш, кўриш)
  | 'ADMIN_ACTION'           // Маъмурий амаллар (созламаларни ўзгартириш, роллар)
  | 'SYSTEM'                 // Тизим ҳодисалари (сервис старт/стоп, қайта ишга тушиш)
  | 'DATA_OPERATION'         // Маълумотлар билан ишлашдаги амаллар (импорт/экспорт, резерв)
  | 'SECURITY';              // Хавфсизлик ҳодисалари (шубҳали фаоллик, блоклашлар)

export interface AuditLog {
  id: string;
  timestamp: string;
  category: AuditLogCategory;
  action: string;
  userId?: string;
  userName: string;
  userRole?: string;
  ip: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface SystemSettings {
  systemTitleUz: string;
  systemTitleRu: string;
  maxConnectingLineMeters: number; // Standart: 50 metr (TTZ 4.2.11)
  defaultInvoiceAmountUzs: number;
  autoGeocodePrefix: string;      // e.g. "UZ"
  maintenanceMode: boolean;
  requireOneIdForStaff: boolean;
  sessionTimeoutMinutes: number;
  uzkadAutoRemovalEnabled: boolean; // C-03
  geonamesAutoValidation: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: 'GIS_XARITA' | 'MANZIL_BERISH' | 'INTEGRATSIYA' | 'TIZIM_XATOLIGI' | 'BOSHQA';
  subject: string;
  message: string;
  priority: 'PAST' | 'ORTA' | 'YUQORI' | 'SHOSHILINCH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  replies: {
    id: string;
    senderName: string;
    isStaff: boolean;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
