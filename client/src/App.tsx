import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GISMap } from './components/GISMap';
import { DashboardPage } from './pages/DashboardPage';
import { RegistryPage } from './pages/RegistryPage';
import { NewAddressPage } from './pages/NewAddressPage';
import { ApplicationsWorkflowPage } from './pages/ApplicationsWorkflowPage';
import { CancellationsPage } from './pages/CancellationsPage';
import { UzkadSimulatorPage } from './pages/UzkadSimulatorPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { BackupPage } from './pages/BackupPage';
import { SettingsPage } from './pages/SettingsPage';
import { GuidePage } from './pages/GuidePage';
import { SupportPage } from './pages/SupportPage';
import { ConnectingPointsLinesPage } from './pages/ConnectingPointsLinesPage';
import { OfficialCertificateModal } from './components/OfficialCertificateModal';
import { AddressDetailModal } from './components/AddressDetailModal';
import { OneIdModal } from './components/OneIdModal';
import { TermsOfferModal } from './components/TermsOfferModal';
import { SupportChatModal } from './components/SupportChatModal';
import { Address } from './types';
import { api } from './services/api';

const MainLayout: React.FC = () => {
  const { role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressForDetail, setSelectedAddressForDetail] = useState<Address | null>(null);
  const [certificateAddressId, setCertificateAddressId] = useState<string | null>(null);
  const [mapSelectedAddress, setMapSelectedAddress] = useState<Address | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(4);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [unreadSmsCount, setUnreadSmsCount] = useState<number>(1);

  const loadAddresses = async () => {
    try {
      const res = await api.getAddresses();
      if (res.success) {
        setAddresses(res.addresses);
      }
      const appRes = await api.getApplications();
      if (appRes.success) {
        const pending = appRes.applications.filter(a => a.stage !== 'APPROVED' && a.stage !== 'REJECTED').length;
        setPendingCount(pending);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [currentTab]);

  const handleNavigateToMap = (addr: Address) => {
    setMapSelectedAddress(addr);
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Inter',sans-serif]">
      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={tab => {
              setCurrentTab(tab);
              if (tab === 'support') {
                setUnreadSmsCount(0);
              }
            }}
            pendingCount={pendingCount}
            unreadSmsCount={unreadSmsCount}
            onOpenChat={() => {
              setCurrentTab('support');
              setUnreadSmsCount(0);
            }}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardPage onNavigate={setCurrentTab} />
            )}

            {currentTab === 'registry' && (
              <RegistryPage
                onSelectAddress={addr => setSelectedAddressForDetail(addr)}
                onOpenCertificate={id => setCertificateAddressId(id)}
                onOpenCancellation={addr => {
                  setCurrentTab('cancellations-c02');
                }}
                onNavigateToMap={handleNavigateToMap}
              />
            )}

            {currentTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      Interaktiv Geofazoviy Xarita (GIS Moduli)
                    </h1>
                    <p className="text-xs text-slate-500">
                      Barcha faol manzillar, kadastr konturlari, kirish nuqtalari va bog'lovchi yo'laklar
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                    Obyektlar soni: {addresses.length} ta
                  </span>
                </div>

                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                  <GISMap
                    addresses={addresses}
                    selectedAddress={mapSelectedAddress}
                    onSelectAddress={addr => setSelectedAddressForDetail(addr)}
                    height="calc(100vh - 250px)"
                    center={mapSelectedAddress ? [mapSelectedAddress.lat, mapSelectedAddress.lng] : [41.2858, 69.2036]}
                    zoom={mapSelectedAddress ? 17 : 13}
                  />
                </div>
              </div>
            )}

            {/* 1) Joriy manzillarni o'zgartirish sub-tabs */}
            {currentTab === 'change-address-new' && (
              <ApplicationsWorkflowPage
                category="change_address"
                initialStatusFilter="new"
                onOpenCertificate={id => setCertificateAddressId(id)}
                onNavigateNew={() => setCurrentTab('new-address-form')}
              />
            )}
            {currentTab === 'change-address-in-progress' && (
              <ApplicationsWorkflowPage
                category="change_address"
                initialStatusFilter="in_progress"
                onOpenCertificate={id => setCertificateAddressId(id)}
                onNavigateNew={() => setCurrentTab('new-address-form')}
              />
            )}
            {currentTab === 'change-address-completed' && (
              <ApplicationsWorkflowPage
                category="change_address"
                initialStatusFilter="completed"
                onOpenCertificate={id => setCertificateAddressId(id)}
                onNavigateNew={() => setCurrentTab('new-address-form')}
              />
            )}
            {currentTab === 'change-address-rejected' && (
              <ApplicationsWorkflowPage
                category="change_address"
                initialStatusFilter="rejected"
                onOpenCertificate={id => setCertificateAddressId(id)}
                onNavigateNew={() => setCurrentTab('new-address-form')}
              />
            )}

            {/* 2) Bog'lash nuqta va/yoki chiziqlarni yaratish */}
            {currentTab === 'connecting-points-lines' && (
              <ConnectingPointsLinesPage />
            )}

            {/* 3) Yangi manzil yaratish sub-tabs */}
            {(currentTab === 'new-address' || currentTab === 'new-address-new') && (
              <ApplicationsWorkflowPage
                category="new_address"
                initialStatusFilter="new"
                onOpenCertificate={id => setCertificateAddressId(id)}
                onNavigateNew={() => setCurrentTab('new-address-form')}
              />
            )}
            {currentTab === 'new-address-in-progress' && (
              <ApplicationsWorkflowPage
                category="new_address"
                initialStatusFilter="in_progress"
                onOpenCertificate={id => setCertificateAddressId(id)}
                onNavigateNew={() => setCurrentTab('new-address-form')}
              />
            )}
            {currentTab === 'new-address-completed' && (
              <ApplicationsWorkflowPage
                category="new_address"
                initialStatusFilter="completed"
                onOpenCertificate={id => setCertificateAddressId(id)}
                onNavigateNew={() => setCurrentTab('new-address-form')}
              />
            )}
            {currentTab === 'new-address-rejected' && (
              <ApplicationsWorkflowPage
                category="new_address"
                initialStatusFilter="rejected"
                onOpenCertificate={id => setCertificateAddressId(id)}
                onNavigateNew={() => setCurrentTab('new-address-form')}
              />
            )}

            {/* Form for new address application */}
            {currentTab === 'new-address-form' && (
              <NewAddressPage
                onSuccess={() => {
                  loadAddresses();
                  setCurrentTab('new-address-in-progress');
                }}
              />
            )}

            {currentTab === 'workflow-c01' && (
              <ApplicationsWorkflowPage
                onOpenCertificate={id => setCertificateAddressId(id)}
              />
            )}

            {/* Cancellations Sub-tabs */}
            {currentTab === 'cancellations-new' && (
              <CancellationsPage initialStatusFilter="new" />
            )}
            {currentTab === 'cancellations-in-progress' && (
              <CancellationsPage initialStatusFilter="in_progress" />
            )}
            {currentTab === 'cancellations-completed' && (
              <CancellationsPage initialStatusFilter="completed" />
            )}
            {currentTab === 'cancellations-rejected' && (
              <CancellationsPage initialStatusFilter="rejected" />
            )}
            {currentTab === 'cancellations-c02' && (
              <CancellationsPage initialStatusFilter="all" />
            )}

            {currentTab === 'uzkad-c03' && (
              <UzkadSimulatorPage />
            )}

            {currentTab === 'integrations' && (
              <IntegrationsPage />
            )}

            {currentTab === 'users' && (
              <UsersPage />
            )}

            {currentTab === 'audit' && (
              <AuditLogsPage />
            )}

            {currentTab === 'backup' && (
              <BackupPage />
            )}

            {currentTab === 'settings' && (
              <SettingsPage />
            )}

            {currentTab === 'guide' && (
              <GuidePage />
            )}

            {currentTab === 'support' && (
              <SupportPage onClearUnread={() => setUnreadSmsCount(0)} />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {certificateAddressId && (
        <OfficialCertificateModal
          addressId={certificateAddressId}
          onClose={() => setCertificateAddressId(null)}
        />
      )}

      {selectedAddressForDetail && (
        <AddressDetailModal
          address={selectedAddressForDetail}
          onClose={() => setSelectedAddressForDetail(null)}
          onOpenCertificate={id => {
            setSelectedAddressForDetail(null);
            setCertificateAddressId(id);
          }}
        />
      )}

      <OneIdModal />
      <TermsOfferModal />
      <SupportChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
