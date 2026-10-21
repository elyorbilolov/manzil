import fs from 'fs';
import path from 'path';
import {
  User,
  Address,
  ApplicationC01,
  CancellationRequestC02,
  UzkadWebhookEventC03,
  AuditLog,
  SystemSettings,
  SupportTicket,
} from './types';

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  addresses: Address[];
  applications: ApplicationC01[];
  cancellations: CancellationRequestC02[];
  uzkadEvents: UzkadWebhookEventC03[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  tickets: SupportTicket[];
}

const defaultSettings: SystemSettings = {
  systemTitleUz: "Ko'chmas mulk obyektlari manzillari reestrining ma'lumotlar bazasi AT",
  systemTitleRu: "ИС База данных реестра адресов объектов недвижимости",
  maxConnectingLineMeters: 50,
  defaultInvoiceAmountUzs: 68000,
  autoGeocodePrefix: "UZ",
  maintenanceMode: false,
  requireOneIdForStaff: true,
  sessionTimeoutMinutes: 120,
  uzkadAutoRemovalEnabled: true,
  geonamesAutoValidation: true,
};

const initialUsers: User[] = [
  {
    id: 'user-admin',
    pinfl: '31201880010023',
    fullName: 'Abdullayev Otabek Shavkatovich',
    email: 'admin@kadastr.uz',
    phone: '+998 71 202-01-23',
    role: 'ADMIN',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    department: 'Raqamli texnologiyalar boshqarmasi',
    isActive: true,
    termsAccepted: true,
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'user-respublika',
    pinfl: '31505850020045',
    fullName: 'Mirmaqsudov Mirkomil Bahodirovich',
    email: 'respublika.mm@kadastr.uz',
    phone: '+998 71 202-55-76',
    role: 'RESPUBLIKA_DKP_MM',
    region: 'Respublika',
    district: 'Bosh boshqarma',
    department: 'Davlat kadastrlari palatasi Respublika apparati',
    isActive: true,
    termsAccepted: true,
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'user-hudud',
    pinfl: '32009890030067',
    fullName: 'Turg\'unov Xurshidbek Anvarovich',
    email: 'hudud.mm@kadastr.uz',
    phone: '+998 90 123-45-67',
    role: 'HUDUD_DKP_MM',
    region: 'Toshkent shahri',
    district: 'Hududiy boshqarma',
    department: 'Toshkent shahar Davlat kadastrlari palatasi',
    isActive: true,
    termsAccepted: true,
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'user-filial-head',
    pinfl: '32211900040089',
    fullName: 'Omonov Sarvar Davronovich',
    email: 'filial.rahbar@kadastr.uz',
    phone: '+998 93 555-44-33',
    role: 'FILIAL_RAHBARI_DKP',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    department: 'Chilonzor tumani filiali rahbariyati',
    isActive: true,
    termsAccepted: true,
    createdAt: '2026-01-15T08:30:00Z',
  },
  {
    id: 'user-filial-mm',
    pinfl: '32502930050011',
    fullName: 'Bo\'riyev Komiljon Ergashovich',
    email: 'filial.mm@kadastr.uz',
    phone: '+998 97 777-88-99',
    role: 'FILIAL_DKP_MM',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    department: 'Chilonzor tumani filiali manzil berish bo\'limi',
    isActive: true,
    termsAccepted: true,
    createdAt: '2026-01-15T08:30:00Z',
  },
  {
    id: 'user-inspector',
    pinfl: '31804910060033',
    fullName: 'Karimov Jasur Nematovich',
    email: 'nazoratchi@kadastr.uz',
    phone: '+998 99 333-22-11',
    role: 'INSPECTOR',
    region: 'Respublika',
    district: 'Nazorat boshqarmasi',
    department: 'Monitoring va hisobotlar boshqarmasi',
    isActive: true,
    termsAccepted: true,
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'user-citizen',
    pinfl: '30101950070055',
    fullName: 'Yo\'ldoshev Alisher Farhodovich',
    email: 'fuqaro@oneid.uz',
    phone: '+998 90 987-65-43',
    role: 'CITIZEN',
    region: 'Toshkent shahri',
    district: 'Yunusobod tumani',
    isActive: true,
    termsAccepted: true,
    createdAt: '2026-02-01T14:20:00Z',
  },
];

const initialAddresses: Address[] = [
  {
    id: 'addr-001',
    geocode: 'UZ-TAS-CHI-2026-000001',
    cadastreNumber: '10:04:02:01:01:0024',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    postalCode: '100097',
    planningStructureType: 'mavze',
    planningStructureName: 'Chilonzor-M mavzesi',
    streetType: 'kocha',
    streetName: 'Cho\'ponota ko\'chasi',
    houseNumber: '6-В',
    objectType: 'noturar',
    fullAddressUz: "Toshkent shahri, Chilonzor tumani, Chilonzor-M mavzesi, Cho'ponota ko'chasi, 6-В uy",
    fullAddressUzCyrillic: "Тошкент шаҳри, Чилонзор тумани, Чилонзор-М мавзеси, Чўпонота кўчаси, 6-В уй",
    fullAddressRu: "г. Ташкент, Чиланзарский район, массив Чиланзар-М, ул. Чупонота, дом 6-В",
    lat: 41.28582,
    lng: 69.20364,
    boundaryPolygon: [
      [41.2861, 69.2032],
      [41.2862, 69.2041],
      [41.2855, 69.2042],
      [41.2854, 69.2033],
    ],
    entrancePoints: [
      {
        id: 'ep-001',
        type: 'main',
        lat: 41.28615,
        lng: 69.20365,
        name: 'Bosh kirish darvozasi',
        isOnBoundary: true,
      },
      {
        id: 'ep-002',
        type: 'secondary',
        lat: 41.28545,
        lng: 69.20375,
        name: 'Xizmat ko\'rsatish eshigi',
        isOnBoundary: true,
      },
    ],
    connectingLine: {
      id: 'conn-001',
      points: [
        [41.28615, 69.20365],
        [41.28635, 69.20365],
      ],
      lengthMeters: 22.4,
      isValid: true,
      targetStreetName: "Cho'ponota ko'chasi",
    },
    status: 'active',
    legalGrounds: "Vazirlar Mahkamasining 2018 yil 14 dekabrdagi 1010-son qarori",
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    createdBy: 'Omonov Sarvar Davronovich (Filial rahbari DKP)',
    history: [
      {
        timestamp: '2026-01-15T10:00:00Z',
        action: "Manzil ro'yxatga olindi va geokod biriktirildi",
        changedBy: 'Omonov Sarvar Davronovich',
        role: 'FILIAL_RAHBARI_DKP',
        details: 'Dastlabki ro\'yxatga olish, geokod UZ-TAS-CHI-2026-000001 biriktirildi',
      },
    ],
  },
  {
    id: 'addr-002',
    geocode: 'UZ-TAS-YAK-2026-000108',
    cadastreNumber: '10:08:01:03:04:0052',
    region: 'Toshkent shahri',
    district: 'Yakkasaroy tumani',
    postalCode: '100100',
    planningStructureType: 'hudud',
    planningStructureName: 'Rakat mahallasi',
    streetType: 'shoh_kocha',
    streetName: 'Shota Rustaveli shoh ko\'chasi',
    houseNumber: '42',
    blockNumber: 'A',
    unitNumber: '14',
    objectType: 'turar_joy',
    fullAddressUz: "Toshkent shahri, Yakkasaroy tumani, Rakat mahallasi, Shota Rustaveli shoh ko'chasi, 42-A uy, 14-xonadon",
    fullAddressUzCyrillic: "Тошкент шаҳри, Яккасарой тумани, Ракат маҳалласи, Шота Руставели шоҳ кўчаси, 42-А уй, 14-хонадон",
    fullAddressRu: "г. Ташкент, Яккасарайский район, махалля Ракат, проспект Шота Руставели, д. 42-А, кв. 14",
    lat: 41.2915,
    lng: 69.2458,
    boundaryPolygon: [
      [41.2918, 69.2454],
      [41.2919, 69.2462],
      [41.2912, 69.2463],
      [41.2911, 69.2455],
    ],
    entrancePoints: [
      {
        id: 'ep-003',
        type: 'main',
        lat: 41.29185,
        lng: 69.2458,
        name: 'Asosiy kirish eshigi (1-podyezd)',
        isOnBoundary: true,
      },
    ],
    connectingLine: {
      id: 'conn-002',
      points: [
        [41.29185, 69.2458],
        [41.29202, 69.2458],
      ],
      lengthMeters: 18.9,
      isValid: true,
      targetStreetName: "Shota Rustaveli shoh ko'chasi",
    },
    status: 'active',
    legalGrounds: "Toshkent shahar hokimi qarori № 412",
    createdAt: '2026-01-20T12:30:00Z',
    updatedAt: '2026-01-20T12:30:00Z',
    createdBy: 'Filial rahbari DKP',
  },
  {
    id: 'addr-003',
    geocode: 'UZ-SAM-SAM-2026-000201',
    cadastreNumber: '14:01:04:01:02:0089',
    region: 'Samarqand viloyati',
    district: 'Samarqand shahri',
    postalCode: '140100',
    planningStructureType: 'hudud',
    planningStructureName: 'Registon mahallasi',
    streetType: 'kocha',
    streetName: 'Registon ko\'chasi',
    houseNumber: '1',
    objectType: 'noturar',
    fullAddressUz: "Samarqand viloyati, Samarqand shahri, Registon mahallasi, Registon ko'chasi, 1-uy",
    fullAddressUzCyrillic: "Самарқанд вилояти, Самарқанд шаҳри, Регистон маҳалласи, Регистон кўчаси, 1-уй",
    fullAddressRu: "Самаркандская область, г. Самарканд, махалля Регистан, ул. Регистан, д. 1",
    lat: 39.6547,
    lng: 66.9758,
    boundaryPolygon: [
      [39.6552, 66.9752],
      [39.6553, 66.9765],
      [39.6542, 66.9766],
      [39.6541, 66.9753],
    ],
    entrancePoints: [
      {
        id: 'ep-004',
        type: 'main',
        lat: 39.65415,
        lng: 66.9758,
        name: 'Asosiy portal kirishi',
        isOnBoundary: true,
      },
    ],
    status: 'active',
    legalGrounds: "Madaniy meros agentligi va Kadastr palatasi ro'yxati",
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-01-25T14:00:00Z',
    createdBy: 'Samarqand shahar filiali',
  },
  {
    id: 'addr-004',
    geocode: 'UZ-BUX-BUX-2026-000305',
    cadastreNumber: '20:01:02:05:01:0014',
    region: 'Buxoro viloyati',
    district: 'Buxoro shahri',
    postalCode: '200100',
    planningStructureType: 'hudud',
    planningStructureName: 'Labi Hovuz mahallasi',
    streetType: 'kocha',
    streetName: 'Naqshband ko\'chasi',
    houseNumber: '45',
    objectType: 'turar_joy',
    fullAddressUz: "Buxoro viloyati, Buxoro shahri, Labi Hovuz mahallasi, Naqshband ko'chasi, 45-uy",
    fullAddressUzCyrillic: "Бухоро вилояти, Бухоро шаҳри, Лаби Ҳовуз маҳалласи, Нақшбанд кўчаси, 45-уй",
    fullAddressRu: "Бухарская область, г. Бухара, махалля Ляби Хауз, ул. Накшбанд, д. 45",
    lat: 39.7745,
    lng: 64.4215,
    entrancePoints: [
      {
        id: 'ep-005',
        type: 'main',
        lat: 39.77455,
        lng: 64.42152,
        name: 'Hovli darvozasi',
        isOnBoundary: true,
      },
    ],
    status: 'active',
    createdAt: '2026-02-01T11:15:00Z',
    updatedAt: '2026-02-01T11:15:00Z',
    createdBy: 'Buxoro shahar filiali',
  },
  {
    id: 'addr-005',
    geocode: 'UZ-TAS-YUN-2025-009840',
    cadastreNumber: '10:02:04:01:01:0012',
    region: 'Toshkent shahri',
    district: 'Yunusobod tumani',
    postalCode: '100084',
    planningStructureType: 'mavze',
    planningStructureName: 'Yunusobod 4-mavze',
    streetType: 'kocha',
    streetName: 'Amir Temur shoh ko\'chasi',
    houseNumber: '88',
    objectType: 'noturar',
    fullAddressUz: "Toshkent shahri, Yunusobod tumani, Yunusobod 4-mavze, Amir Temur shoh ko'chasi, 88-uy",
    fullAddressUzCyrillic: "Тошкент шаҳри, Юнусобод тумани, Юнусобод 4-мавзе, Амир Темур шоҳ кўчаси, 88-уй",
    fullAddressRu: "г. Ташкент, Юнусабадский район, массив Юнусабад 4, ул. Амира Темура, д. 88",
    lat: 41.3412,
    lng: 69.2854,
    entrancePoints: [],
    status: 'cancelled',
    statusReason: "Obyekt buzilgan (UZKAD xabarnomasi bo'yicha)",
    legalGrounds: "Toshkent shahar hokimiyati buzish qarori № 891",
    createdAt: '2025-11-10T09:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
    createdBy: 'Yunusobod filiali',
  },
];

const initialApplications: ApplicationC01[] = [
  {
    id: 'app-101',
    applicationNumber: 'APP-2026-00101',
    source: 'MYGOV',
    applicantType: 'INDIVIDUAL',
    applicantName: 'Tolipov Dilshod Baxtiyorovich',
    applicantPinflOrStir: '31502900010044',
    applicantPhone: '+998 90 321-65-87',
    cadastreNumber: '10:04:03:02:01:0048',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    postalCode: '100097',
    planningStructureType: 'mavze',
    planningStructureName: 'Chilonzor 9-mavze',
    streetType: 'kocha',
    streetName: 'Lutfiy ko\'chasi',
    houseNumber: '18-B',
    objectType: 'turar_joy',
    lat: 41.2789,
    lng: 69.2145,
    boundaryPolygon: [
      [41.2792, 69.2141],
      [41.2793, 69.2150],
      [41.2786, 69.2151],
      [41.2785, 69.2142],
    ],
    entrancePoints: [
      {
        id: 'ep-app-1',
        type: 'main',
        lat: 41.27925,
        lng: 69.21455,
        name: 'Asosiy kirish eshigi',
        isOnBoundary: true,
      },
    ],
    isPaidService: false,
    isPaid: true,
    stage: 'FILIAL_REVIEW',
    timeline: [
      {
        stage: 'SUBMITTED',
        timestamp: '2026-02-18T10:15:00Z',
        actorName: 'Tolipov Dilshod (Ariza beruvchi)',
        actorRole: 'CITIZEN',
        comment: 'MyGov orqali yangi qurilgan hovli joyga manzil berish arizasi topshirildi',
      },
    ],
    createdAt: '2026-02-18T10:15:00Z',
    updatedAt: '2026-02-18T10:15:00Z',
  },
  {
    id: 'app-102',
    applicationNumber: 'APP-2026-00102',
    source: 'UZKAD',
    applicantType: 'LEGAL',
    applicantName: '"ORIENT PROPERTIES" MChJ',
    applicantPinflOrStir: '204892110',
    applicantPhone: '+998 71 200-88-77',
    cadastreNumber: '10:04:01:04:02:0110',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    postalCode: '100115',
    planningStructureType: 'mavze',
    planningStructureName: 'Chilonzor 3-mavze',
    streetType: 'kocha',
    streetName: 'Qatortol ko\'chasi',
    houseNumber: '25-uy',
    unitNumber: 'Ofis 401',
    objectType: 'noturar',
    lat: 41.2821,
    lng: 69.2234,
    entrancePoints: [
      {
        id: 'ep-app-2',
        type: 'main',
        lat: 41.28215,
        lng: 69.22345,
        name: 'Biznes markaz bosh kirishi',
        isOnBoundary: true,
      },
    ],
    isPaidService: true,
    invoiceNumber: 'INV-2026-0089',
    invoiceAmountUzs: 68000,
    isPaid: false,
    stage: 'FILIAL_HEAD_REVIEW',
    assignedGeocode: 'UZ-TAS-CHI-2026-000492',
    timeline: [
      {
        stage: 'SUBMITTED',
        timestamp: '2026-02-17T09:00:00Z',
        actorName: 'UZKAD Tizimi',
        actorRole: 'SYSTEM',
        comment: 'UZKAD integratsiyasi orqali yangi tijorat obyektiga manzil so\'rovi kelib tushdi',
      },
      {
        stage: 'FILIAL_REVIEW',
        timestamp: '2026-02-17T14:30:00Z',
        actorName: "Bo'riyev Komiljon (Filial MM)",
        actorRole: 'FILIAL_DKP_MM',
        comment: 'Kirish nuqtalari tekshirildi, avtomatik manzil moduli orqali geokod tayinlandi va rahbar ko\'rib chiqishiga yuborildi',
      },
    ],
    createdAt: '2026-02-17T09:00:00Z',
    updatedAt: '2026-02-17T14:30:00Z',
  },
  {
    id: 'app-103',
    applicationNumber: 'APP-2026-00103',
    source: 'DIRECT',
    applicantType: 'INDIVIDUAL',
    applicantName: 'Nazarova Gulnoza Erkinovna',
    applicantPinflOrStir: '42205920020019',
    applicantPhone: '+998 94 654-32-10',
    cadastreNumber: '10:04:05:01:03:0033',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    postalCode: '100097',
    planningStructureType: 'hudud',
    planningStructureName: 'Do\'mbrobod mahallasi',
    streetType: 'berk_kocha',
    streetName: 'Do\'mbrobod 3-tor ko\'cha',
    houseNumber: '12',
    objectType: 'turar_joy',
    lat: 41.2715,
    lng: 69.2085,
    entrancePoints: [
      {
        id: 'ep-app-3',
        type: 'main',
        lat: 41.27155,
        lng: 69.20852,
        name: 'Hovli darvozasi',
        isOnBoundary: true,
      },
    ],
    connectingLine: {
      id: 'conn-app-3',
      points: [
        [41.27155, 69.20852],
        [41.27185, 69.20852],
      ],
      lengthMeters: 33.5,
      isValid: true,
      targetStreetName: "Do'mbrobod berk ko'chasi",
    },
    isPaidService: false,
    isPaid: true,
    stage: 'REGION_AGREEMENT',
    assignedGeocode: 'UZ-TAS-CHI-2026-000511',
    timeline: [
      {
        stage: 'SUBMITTED',
        timestamp: '2026-02-16T11:00:00Z',
        actorName: 'Nazarova Gulnoza',
        actorRole: 'CITIZEN',
        comment: 'Ariza qabul qilindi',
      },
      {
        stage: 'FILIAL_REVIEW',
        timestamp: '2026-02-16T15:20:00Z',
        actorName: "Bo'riyev Komiljon",
        actorRole: 'FILIAL_DKP_MM',
        comment: 'Ko\'cha bevosita ulanmaganligi sababli 33.5m bog\'lovchi yo\'lak chizildi',
      },
      {
        stage: 'FILIAL_HEAD_REVIEW',
        timestamp: '2026-02-17T11:00:00Z',
        actorName: 'Omonov Sarvar (Filial rahbari)',
        actorRole: 'FILIAL_RAHBARI_DKP',
        comment: 'Bog\'lovchi yo\'lak mavjudligi sababli Hudud DKP MM kelishuviga yuborildi',
      },
    ],
    createdAt: '2026-02-16T11:00:00Z',
    updatedAt: '2026-02-17T11:00:00Z',
  },
  {
    id: 'app-104',
    applicationNumber: 'APP-2026-00104',
    source: 'YIDXP',
    applicantType: 'LEGAL',
    applicantName: '"TOSHKENT CITY LOGISTICS" MChJ',
    applicantPinflOrStir: '302918273',
    applicantPhone: '+998 71 210-90-90',
    cadastreNumber: '10:04:06:01:01:0077',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    postalCode: '100115',
    planningStructureType: 'ishlab_chiqarish_maydoni',
    planningStructureName: 'Chilonzor sanoat zonasi',
    streetType: 'magistral',
    streetName: 'Katta Halqa Yo\'li',
    houseNumber: '15/2',
    objectType: 'noturar',
    lat: 41.2645,
    lng: 69.1952,
    entrancePoints: [
      {
        id: 'ep-app-4',
        type: 'main',
        lat: 41.26455,
        lng: 69.19522,
        name: 'Yuk tashish darvozasi',
        isOnBoundary: true,
      },
    ],
    connectingLine: {
      id: 'conn-app-4',
      points: [
        [41.26455, 69.19522],
        [41.26495, 69.19522],
      ],
      lengthMeters: 44.2,
      isValid: true,
      targetStreetName: "Katta Halqa Yo'li yordamchi yo'lagi",
    },
    isPaidService: true,
    invoiceNumber: 'INV-2026-0094',
    invoiceAmountUzs: 68000,
    isPaid: true,
    stage: 'REPUBLIC_APPROVAL',
    assignedGeocode: 'UZ-TAS-CHI-2026-000540',
    timeline: [
      {
        stage: 'SUBMITTED',
        timestamp: '2026-02-15T08:00:00Z',
        actorName: 'YIDXP',
        actorRole: 'SYSTEM',
        comment: 'YIDXP orqali kelib tushdi',
      },
      {
        stage: 'FILIAL_REVIEW',
        timestamp: '2026-02-15T12:00:00Z',
        actorName: "Bo'riyev Komiljon",
        actorRole: 'FILIAL_DKP_MM',
        comment: 'Kirish nuqtasi va 44.2m bog\'lovchi yo\'lak belgilandi',
      },
      {
        stage: 'FILIAL_HEAD_REVIEW',
        timestamp: '2026-02-15T16:00:00Z',
        actorName: 'Omonov Sarvar',
        actorRole: 'FILIAL_RAHBARI_DKP',
        comment: 'Viloyatga yuborildi',
      },
      {
        stage: 'REGION_AGREEMENT',
        timestamp: '2026-02-16T10:00:00Z',
        actorName: "Turg'unov Xurshidbek (Hudud DKP MM)",
        actorRole: 'HUDUD_DKP_MM',
        comment: 'Hududiy boshqarma kelishdi, Respublika DKP MM tasdiqlashiga yuborildi',
      },
    ],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-16T10:00:00Z',
  },
];

const initialCancellations: CancellationRequestC02[] = [
  {
    id: 'can-001',
    requestNumber: 'CAN-2026-00041',
    addressId: 'addr-002',
    geocode: 'UZ-TAS-YAK-2026-000108',
    fullAddress: "Toshkent shahri, Yakkasaroy tumani, Rakat mahallasi, Shota Rustaveli shoh ko'chasi, 42-A uy",
    cadastreNumber: '10:08:01:03:04:0052',
    reason: "Qayta rejalashtirish va yangi qurilish loyihasi munosabati bilan manzilni bekor qilish",
    legalDocumentNumber: 'Q-2026/84',
    legalDocumentDate: '2026-02-10',
    stage: 'FILIAL_SUBMITTED',
    timeline: [
      {
        stage: 'FILIAL_SUBMITTED',
        timestamp: '2026-02-18T14:00:00Z',
        actorName: "Bo'riyev Komiljon",
        actorRole: 'FILIAL_DKP_MM',
        comment: 'Qayta qurilish to\'g\'risidagi qaror asosida manzilni o\'chirish taklifi kiritildi',
      },
    ],
    createdAt: '2026-02-18T14:00:00Z',
    updatedAt: '2026-02-18T14:00:00Z',
  },
];

const initialUzkadEvents: UzkadWebhookEventC03[] = [
  {
    id: 'uzkad-evt-01',
    eventId: 'UZKAD-EVT-9921',
    cadastreNumber: '10:02:04:01:01:0012',
    objectDeletionType: 'DEMOLISHED',
    documentBasis: "Toshkent shahar hokimiyati buzish qarori № 891",
    notifiedAt: '2026-02-14T15:55:00Z',
    processed: true,
    processedAt: '2026-02-14T16:00:00Z',
    targetAddressId: 'addr-005',
    targetGeocode: 'UZ-TAS-YUN-2025-009840',
    actionTaken: "Manzil avtomatik tarzda bekor qilindi va arxivga o'tkazildi (C-03)",
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-02-19T08:00:15Z',
    category: 'SYSTEM',
    action: 'Tizim ishga tushirildi',
    userName: 'Tizim yadrosi',
    ip: '127.0.0.1',
    details: 'Barcha modullar va ma\'lumotlar bazasi tayyor holatda',
    status: 'SUCCESS',
  },
  {
    id: 'log-002',
    timestamp: '2026-02-19T08:15:32Z',
    category: 'AUTH',
    action: 'OneID orqali muvaffaqiyatli kirish',
    userId: 'user-admin',
    userName: 'Abdullayev Otabek Shavkatovich',
    userRole: 'ADMIN',
    ip: '192.168.1.104',
    details: 'JSHSHIR: 31201880010023, Sessiya ID: sess-84912',
    status: 'SUCCESS',
  },
  {
    id: 'log-003',
    category: 'USER_ACTION',
    action: 'Manzil qidiruvi amalga oshirildi',
    userId: 'user-filial-mm',
    userName: "Bo'riyev Komiljon",
    userRole: 'FILIAL_DKP_MM',
    timestamp: '2026-02-19T09:20:00Z',
    ip: '192.168.1.155',
    details: 'Filtr: Cho\'ponota ko\'chasi, tuman: Chilonzor',
    status: 'SUCCESS',
  },
  {
    id: 'log-004',
    category: 'DATA_OPERATION',
    action: "Yangi manzil arizasi qabul qilindi (C-01)",
    userId: 'user-filial-mm',
    userName: "Bo'riyev Komiljon",
    userRole: 'FILIAL_DKP_MM',
    timestamp: '2026-02-19T10:05:40Z',
    ip: '192.168.1.155',
    details: 'Ariza raqami: APP-2026-00101, Kadastr: 10:04:03:02:01:0048',
    status: 'SUCCESS',
  },
];

const initialTickets: SupportTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TKT-2026-0012',
    userId: 'user-filial-mm',
    userName: "Bo'riyev Komiljon",
    userEmail: 'filial.mm@kadastr.uz',
    category: 'GIS_XARITA',
    subject: "Bog'lovchi chiziq uzunligini xaritada aniq o'lchash",
    message: "Ba'zi tor ko'chalarda bog'lovchi yo'lak 48 metr chiqqanda chegara to'g'ri o'tirganini qanday tekshirish mumkin?",
    priority: 'ORTA',
    status: 'IN_PROGRESS',
    replies: [
      {
        id: 'rep-001',
        senderName: 'Abdullayev Otabek (Admin)',
        isStaff: true,
        message: "Xarita panelidagi 'O'lchash' vositasini tanlab, koordinatalarni tekshirishingiz mumkin. TTZ bo'yicha 50 metrgacha ruxsat etiladi.",
        timestamp: '2026-02-19T11:00:00Z',
      },
    ],
    createdAt: '2026-02-19T10:30:00Z',
    updatedAt: '2026-02-19T11:00:00Z',
  },
];

export class StorageService {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.warn('Existing db.json could not be parsed, initializing fresh storage.');
        this.data = this.getInitialData();
        this.save();
      }
    } else {
      this.data = this.getInitialData();
      this.save();
    }
  }

  private getInitialData(): DatabaseSchema {
    return {
      users: initialUsers,
      addresses: initialAddresses,
      applications: initialApplications,
      cancellations: initialCancellations,
      uzkadEvents: initialUzkadEvents,
      auditLogs: initialAuditLogs,
      settings: defaultSettings,
      tickets: initialTickets,
    };
  }

  private save(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }
  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id || u.email === id || u.pinfl === id);
  }
  saveUser(user: User): User {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.users[idx] = user;
    } else {
      this.data.users.push(user);
    }
    this.save();
    return user;
  }
  deleteUser(id: string): boolean {
    const prev = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  // Addresses
  getAddresses(): Address[] {
    return this.data.addresses;
  }
  getAddressById(id: string): Address | undefined {
    return this.data.addresses.find(a => a.id === id || a.geocode === id);
  }
  saveAddress(addr: Address): Address {
    const idx = this.data.addresses.findIndex(a => a.id === addr.id);
    if (idx >= 0) {
      this.data.addresses[idx] = addr;
    } else {
      this.data.addresses.unshift(addr);
    }
    this.save();
    return addr;
  }

  // Applications (C-01)
  getApplications(): ApplicationC01[] {
    return this.data.applications;
  }
  getApplicationById(id: string): ApplicationC01 | undefined {
    return this.data.applications.find(a => a.id === id || a.applicationNumber === id);
  }
  saveApplication(app: ApplicationC01): ApplicationC01 {
    const idx = this.data.applications.findIndex(a => a.id === app.id);
    if (idx >= 0) {
      this.data.applications[idx] = app;
    } else {
      this.data.applications.unshift(app);
    }
    this.save();
    return app;
  }

  // Cancellations (C-02)
  getCancellations(): CancellationRequestC02[] {
    return this.data.cancellations;
  }
  getCancellationById(id: string): CancellationRequestC02 | undefined {
    return this.data.cancellations.find(c => c.id === id || c.requestNumber === id);
  }
  saveCancellation(c: CancellationRequestC02): CancellationRequestC02 {
    const idx = this.data.cancellations.findIndex(x => x.id === c.id);
    if (idx >= 0) {
      this.data.cancellations[idx] = c;
    } else {
      this.data.cancellations.unshift(c);
    }
    this.save();
    return c;
  }

  // UZKAD Events (C-03)
  getUzkadEvents(): UzkadWebhookEventC03[] {
    return this.data.uzkadEvents;
  }
  saveUzkadEvent(evt: UzkadWebhookEventC03): UzkadWebhookEventC03 {
    this.data.uzkadEvents.unshift(evt);
    this.save();
    return evt;
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }
  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'> & { timestamp?: string }): AuditLog {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      ...log,
    };
    this.data.auditLogs.unshift(newLog);
    // Keep max 2000 in memory
    if (this.data.auditLogs.length > 2000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 2000);
    }
    this.save();
    return newLog;
  }

  // Settings
  getSettings(): SystemSettings {
    return this.data.settings;
  }
  saveSettings(settings: SystemSettings): SystemSettings {
    this.data.settings = settings;
    this.save();
    return settings;
  }

  // Tickets
  getTickets(): SupportTicket[] {
    return this.data.tickets;
  }
  getTicketById(id: string): SupportTicket | undefined {
    return this.data.tickets.find(t => t.id === id || t.ticketNumber === id);
  }
  saveTicket(ticket: SupportTicket): SupportTicket {
    const idx = this.data.tickets.findIndex(t => t.id === ticket.id);
    if (idx >= 0) {
      this.data.tickets[idx] = ticket;
    } else {
      this.data.tickets.unshift(ticket);
    }
    this.save();
    return ticket;
  }

  // Database Dump & Restore (Backup)
  exportBackup(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }
  importBackup(backupData: Partial<DatabaseSchema>): boolean {
    if (!backupData || typeof backupData !== 'object') return false;
    if (backupData.users) this.data.users = backupData.users;
    if (backupData.addresses) this.data.addresses = backupData.addresses;
    if (backupData.applications) this.data.applications = backupData.applications;
    if (backupData.cancellations) this.data.cancellations = backupData.cancellations;
    if (backupData.uzkadEvents) this.data.uzkadEvents = backupData.uzkadEvents;
    if (backupData.auditLogs) this.data.auditLogs = backupData.auditLogs;
    if (backupData.settings) this.data.settings = backupData.settings;
    if (backupData.tickets) this.data.tickets = backupData.tickets;
    this.save();
    return true;
  }
}

export const db = new StorageService();
