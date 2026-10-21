export type UserRole =
  | 'RESPUBLIKA_DKP_MM'     // Respublika DKP MM
  | 'HUDUD_DKP_MM'          // Hudud DKP MM
  | 'FILIAL_RAHBARI_DKP'    // Filial rahbari DKP
  | 'FILIAL_DKP_MM'         // Filial DKP MM
  | 'ADMIN'                 // Tizim administratori
  | 'INSPECTOR'             // Nazoratchi / mas'ul xodim
  | 'CITIZEN';              // Tinglovchi / Fuqaro

export interface User {
  id: string;
  pinfl: string;
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
  | 'shoh_kocha'
  | 'kocha'
  | 'xiyobon'
  | 'bolak'
  | 'otish_joyi'
  | 'maydon'
  | 'sayilgoh'
  | 'berk_kocha'
  | 'chiqish'
  | 'magistral';

export type PlanningStructureType =
  | 'massiv'
  | 'mikrorayon'
  | 'mavze'
  | 'turar_joy_massivi'
  | 'ishlab_chiqarish_maydoni'
  | 'qirgoq'
  | 'hudud';

export interface EntrancePoint {
  id: string;
  type: 'main' | 'secondary';
  lat: number;
  lng: number;
  name?: string;
  isOnBoundary: boolean;
}

export interface ConnectingLine {
  id: string;
  points: [number, number][];
  lengthMeters: number;
  isValid: boolean;
  targetStreetId?: string;
  targetStreetName?: string;
}

export interface Address {
  id: string;
  geocode: string;
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
  fullAddressUz: string;
  fullAddressUzCyrillic: string;
  fullAddressRu: string;
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
  history?: {
    timestamp: string;
    action: string;
    changedBy: string;
    role: string;
    details: string;
  }[];
}

export type ApplicationStage =
  | 'FILIAL_REVIEW'
  | 'FILIAL_HEAD_REVIEW'
  | 'REGION_AGREEMENT'
  | 'REPUBLIC_APPROVAL'
  | 'PAYMENT_PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface ApplicationC01 {
  id: string;
  applicationNumber: string;
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
  | 'FILIAL_SUBMITTED'
  | 'FILIAL_HEAD_REVIEW'
  | 'REGION_AGREEMENT'
  | 'REPUBLIC_APPROVAL'
  | 'COMPLETED'
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
  | 'AUTH'
  | 'AUTHORIZATION'
  | 'USER_ACTION'
  | 'ADMIN_ACTION'
  | 'SYSTEM'
  | 'DATA_OPERATION'
  | 'SECURITY';

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
  maxConnectingLineMeters: number;
  defaultInvoiceAmountUzs: number;
  autoGeocodePrefix: string;
  maintenanceMode: boolean;
  requireOneIdForStaff: boolean;
  sessionTimeoutMinutes: number;
  uzkadAutoRemovalEnabled: boolean;
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

export interface CertificateData {
  certificateNumber: string;
  issuedDate: string;
  cadastreAgency: string;
  registryName: string;
  address: Address;
  qrPayload: string;
  digitalSignatureHash: string;
  verificationUrl: string;
}
