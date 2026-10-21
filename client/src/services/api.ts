import {
  Address,
  ApplicationC01,
  CancellationRequestC02,
  UzkadWebhookEventC03,
  AuditLog,
  SystemSettings,
  SupportTicket,
  User,
  CertificateData,
  UserRole,
} from '../types';
import { handleMockRequest } from './mockStorage';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    // If backend is not available (e.g. static host like Netlify returning 404 or index.html)
    return handleMockRequest(url, options) as T;
  } catch (err) {
    // Network error or fetch failed -> fallback to mock storage seamlessly
    return handleMockRequest(url, options) as T;
  }
}

export const api = {
  // Auth
  login: (identifier: string) =>
    fetchJson<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  oneIdLogin: (data: { pinfl: string; fullName: string; email?: string; phone?: string }) =>
    fetchJson<{ success: boolean; token: string; user: User }>('/auth/oneid', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  switchRole: (role: UserRole) =>
    fetchJson<{ success: boolean; token: string; user: User }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  acceptTerms: (userId: string) =>
    fetchJson<{ success: boolean; user: User }>('/auth/accept-terms', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Stats
  getStats: () =>
    fetchJson<{
      success: boolean;
      summary: {
        totalAddresses: number;
        activeAddresses: number;
        cancelledAddresses: number;
        totalApplications: number;
        pendingApplications: number;
        cancellationsCount: number;
        auditLogsCount: number;
        systemUptimePercent: number;
        responseTimeMs: number;
      };
      byRegion: Record<string, number>;
      byStage: Record<string, number>;
    }>('/stats'),

  // Addresses
  getAddresses: (params?: { q?: string; region?: string; district?: string; status?: string; objectType?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; count: number; addresses: Address[] }>(`/addresses?${query}`);
  },

  getAddressById: (id: string) =>
    fetchJson<{ success: boolean; address: Address }>(`/addresses/${id}`),

  createAddress: (data: Partial<Address>) =>
    fetchJson<{ success: boolean; address: Address }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAddress: (id: string, data: Partial<Address>) =>
    fetchJson<{ success: boolean; address: Address }>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getCertificate: (id: string, userName?: string) =>
    fetchJson<{ success: boolean; certificate: CertificateData }>(`/addresses/${id}/certificate?userName=${encodeURIComponent(userName || '')}`),

  // Applications (C-01)
  getApplications: (params?: { stage?: string; source?: string; region?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; count: number; applications: ApplicationC01[] }>(`/applications?${query}`);
  },

  getApplicationById: (id: string) =>
    fetchJson<{ success: boolean; application: ApplicationC01 }>(`/applications/${id}`),

  createApplication: (data: Partial<ApplicationC01>) =>
    fetchJson<{ success: boolean; application: ApplicationC01 }>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  filialReviewApplication: (id: string, data: any) =>
    fetchJson<{ success: boolean; application: ApplicationC01 }>(`/applications/${id}/filial-review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  filialHeadActionApplication: (id: string, data: { action: 'approve' | 'return' | 'reject'; comment?: string; actorName?: string }) =>
    fetchJson<{ success: boolean; application: ApplicationC01 }>(`/applications/${id}/filial-head-action`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  regionAgreementApplication: (id: string, data: { action: 'agree' | 'return'; comment?: string; actorName?: string }) =>
    fetchJson<{ success: boolean; application: ApplicationC01 }>(`/applications/${id}/region-agreement`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  republicApprovalApplication: (id: string, data: { action: 'approve' | 'return'; comment?: string; actorName?: string }) =>
    fetchJson<{ success: boolean; application: ApplicationC01 }>(`/applications/${id}/republic-approval`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  payInvoice: (id: string) =>
    fetchJson<{ success: boolean; application: ApplicationC01 }>(`/applications/${id}/pay-invoice`, {
      method: 'POST',
    }),

  // Cancellations (C-02)
  getCancellations: () =>
    fetchJson<{ success: boolean; cancellations: CancellationRequestC02[] }>('/cancellations'),

  createCancellation: (data: any) =>
    fetchJson<{ success: boolean; cancellation: CancellationRequestC02 }>('/cancellations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  filialHeadCancellationAction: (id: string, data: { action: 'forward' | 'reject'; comment?: string; actorName?: string }) =>
    fetchJson<{ success: boolean; cancellation: CancellationRequestC02 }>(`/cancellations/${id}/filial-head-action`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  regionCancellationAgreement: (id: string, data: { action: 'agree' | 'reject'; comment?: string; actorName?: string }) =>
    fetchJson<{ success: boolean; cancellation: CancellationRequestC02 }>(`/cancellations/${id}/region-agreement`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  republicCancellationApproval: (id: string, data: { action: 'approve' | 'reject'; comment?: string; actorName?: string }) =>
    fetchJson<{ success: boolean; cancellation: CancellationRequestC02 }>(`/cancellations/${id}/republic-approval`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Integrations & C-03 UZKAD Webhook
  getIntegrationsStatus: () =>
    fetchJson<{ success: boolean; integrations: any[] }>('/integrations/status'),

  getUzkadEvents: () =>
    fetchJson<{ success: boolean; events: UzkadWebhookEventC03[] }>('/integrations/uzkad-events'),

  triggerUzkadWebhook: (data: { cadastreNumber: string; objectDeletionType: string; documentBasis: string }) =>
    fetchJson<{ success: boolean; message: string; event: UzkadWebhookEventC03 }>('/integrations/uzkad/webhook', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getGeonamesStreets: (params?: { query?: string; district?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; streets: any[] }>(`/integrations/geonames/streets?${query}`);
  },

  getUzkadParcelLookup: (cadastreNumber: string) =>
    fetchJson<{ success: boolean; boundaryPolygon: [number, number][]; ownerName: string; pinflOrStir: string; areaHa: number }>(
      `/integrations/uzkad/parcel-lookup?cadastreNumber=${encodeURIComponent(cadastreNumber)}`
    ),

  // Audit Logs
  getAuditLogs: (params?: { category?: string; status?: string; query?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<{ success: boolean; count: number; logs: AuditLog[] }>(`/audit-logs?${query}`);
  },

  // Users & RBAC
  getUsers: () =>
    fetchJson<{ success: boolean; users: User[] }>('/users'),

  createUser: (data: Partial<User>) =>
    fetchJson<{ success: boolean; user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (id: string, data: Partial<User>) =>
    fetchJson<{ success: boolean; user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    fetchJson<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () =>
    fetchJson<{ success: boolean; settings: SystemSettings }>('/settings'),

  updateSettings: (data: Partial<SystemSettings>) =>
    fetchJson<{ success: boolean; settings: SystemSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Backup
  exportBackupUrl: '/api/backup/export',

  importBackup: (data: any) =>
    fetchJson<{ success: boolean; message: string }>('/backup/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tickets
  getTickets: () =>
    fetchJson<{ success: boolean; tickets: SupportTicket[] }>('/tickets'),

  createTicket: (data: Partial<SupportTicket>) =>
    fetchJson<{ success: boolean; ticket: SupportTicket }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  replyTicket: (id: string, data: { senderName: string; isStaff: boolean; message: string; newStatus?: string }) =>
    fetchJson<{ success: boolean; ticket: SupportTicket }>(`/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
