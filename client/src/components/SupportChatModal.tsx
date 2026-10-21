import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  X,
  Headphones,
  Paperclip,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  Bot,
  Image as ImageIcon,
  FileText,
  Download,
  Search,
  Maximize2,
  Minimize2,
  Phone,
  Video,
  Smile,
  Mic,
  MapPin,
  Shield,
  Building2,
  CheckCircle2
} from 'lucide-react';

export interface TelegramContact {
  id: string;
  name: string;
  roleName: string;
  roleCode: 'Super_admin' | 'admin' | 'republic_staff' | 'region_staff' | 'district_chief' | 'district_staff';
  organization: 'Geoinfocom' | 'Kadastr agentligi' | 'DKP Respublika' | 'DKP boshqarma' | 'DKP tuman';
  avatarBg: string;
  initials: string;
  isOnline: boolean;
  statusText: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderOrg: string;
  text?: string;
  image?: string;
  file?: {
    name: string;
    size: string;
    type: string;
  };
  time: string;
  isOutgoing: boolean;
  status: 'sent' | 'delivered' | 'read';
}

const defaultContacts: TelegramContact[] = [
  {
    id: 'grp-support',
    name: "Texnik ko'mak guruhi",
    roleName: 'Umumiy texnik chat',
    roleCode: 'admin',
    organization: 'Kadastr agentligi',
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
    initials: 'TK',
    isOnline: true,
    statusText: '24/7 monitoring markazi faol',
    unreadCount: 1,
  },
  {
    id: 'user-republic',
    name: 'Respublika mutaxassisi',
    roleName: 'Respublika xodim',
    roleCode: 'republic_staff',
    organization: 'DKP Respublika',
    avatarBg: 'bg-emerald-600',
    initials: 'RM',
    isOnline: true,
    statusText: 'onlayn',
    unreadCount: 2,
  },
  {
    id: 'user-region',
    name: 'Viloyat mutaxassisi',
    roleName: 'Viloyat xodim',
    roleCode: 'region_staff',
    organization: 'DKP boshqarma',
    avatarBg: 'bg-purple-600',
    initials: 'VM',
    isOnline: true,
    statusText: 'onlayn',
    unreadCount: 0,
  },
  {
    id: 'user-district-chief',
    name: 'Tuman rahbari',
    roleName: 'Tuman raxbar',
    roleCode: 'district_chief',
    organization: 'DKP tuman',
    avatarBg: 'bg-amber-600',
    initials: 'TR',
    isOnline: false,
    statusText: 'oxirgi marta 12 daqiqa oldin',
    unreadCount: 0,
  },
  {
    id: 'user-district-staff',
    name: 'Tuman mutaxassisi',
    roleName: 'Tuman xodim',
    roleCode: 'district_staff',
    organization: 'DKP tuman',
    avatarBg: 'bg-cyan-600',
    initials: 'TM',
    isOnline: true,
    statusText: 'onlayn',
    unreadCount: 0,
  },
  {
    id: 'user-superadmin',
    name: 'Superadmin (Geoinfocom)',
    roleName: 'Superadmin',
    roleCode: 'Super_admin',
    organization: 'Geoinfocom',
    avatarBg: 'bg-rose-600',
    initials: 'SA',
    isOnline: true,
    statusText: 'serverlar 99.9% faol',
    unreadCount: 0,
  },
  {
    id: 'user-admin',
    name: 'Tizim administratori',
    roleName: 'Admin',
    roleCode: 'admin',
    organization: 'Kadastr agentligi',
    avatarBg: 'bg-blue-600',
    initials: 'TA',
    isOnline: true,
    statusText: 'onlayn',
    unreadCount: 0,
  },
];

const initialThreadMessages: Record<string, ChatMessage[]> = {
  'grp-support': [
    {
      id: 'm-grp-1',
      senderId: 'support',
      senderName: "Texnik ko'mak guruhi",
      senderRole: 'Admin',
      senderOrg: 'Kadastr agentligi',
      text: 'Assalomu alaykum, mutaxassislar! "Manzillar reestri" axborot tizimi bo\'yicha texnik ko\'mak guruhi ishlamoqda. Har qanday savol, xarita xatoligi yoki fayllarni shu yerda yuborishingiz mumkin.',
      time: '17:15',
      isOutgoing: false,
      status: 'read',
    },
    {
      id: 'm-grp-2',
      senderId: 'my-user',
      senderName: 'Bilolov Elyor (Siz)',
      senderRole: 'Admin',
      senderOrg: 'Kadastr agentligi',
      text: 'Assalomu alaykum. Manzil arizalarini kiritishda bino kirish nuqtasi va bog\'lovchi yo\'lak chizmasi bo\'yicha tekshiruvlar to\'liq amalga oshirildi.',
      time: '17:18',
      isOutgoing: true,
      status: 'read',
    },
  ],
  'user-republic': [
    {
      id: 'm-rep-1',
      senderId: 'user-republic',
      senderName: 'Respublika mutaxassisi',
      senderRole: 'Respublika xodim',
      senderOrg: 'DKP Respublika',
      text: 'Assalomu alaykum, mutaxassislar! Reglament bo\'yicha arizalarni ko\'rib chiqish muddati 3 ish kuni qilib belgilangan. Hozirda 2 ta yangi ariza kelib tushdi.',
      time: '17:05',
      isOutgoing: false,
      status: 'read',
    },
    {
      id: 'm-rep-2',
      senderId: 'user-republic',
      senderName: 'Respublika mutaxassisi',
      senderRole: 'Respublika xodim',
      senderOrg: 'DKP Respublika',
      text: 'Agar arizaga kadastr hujjati yoki topografik chizma biriktirilishi kerak bo\'lsa, bemalol ushbu chat orqali PDF yoki rasm faylini yuborishingiz mumkin.',
      time: '17:06',
      isOutgoing: false,
      status: 'read',
    },
  ],
  'user-region': [
    {
      id: 'm-reg-1',
      senderId: 'user-region',
      senderName: 'Viloyat mutaxassisi',
      senderRole: 'Viloyat xodim',
      senderOrg: 'DKP boshqarma',
      text: 'Salom! 1-bosqichda shakllantirilgan manzil arizalarini tekshirib chiqdim. 1 ta ko\'chada pochta indeksi yangilanmagan ekan, Sozlamalar bo\'limidan indeksni to\'g\'rilab yuborsangiz tasdiqlaymiz.',
      time: '16:40',
      isOutgoing: false,
      status: 'read',
    },
  ],
  'user-district-chief': [
    {
      id: 'm-dc-1',
      senderId: 'user-district-chief',
      senderName: 'Tuman rahbari',
      senderRole: 'Tuman raxbar',
      senderOrg: 'DKP tuman',
      text: 'Bugungi arizalarni ERI (elektron raqamli imzo) orqali imzolab viloyatga yo\'naltirdim. Yangi arizalar bo\'lsa tezda kiritilsin.',
      time: '15:20',
      isOutgoing: false,
      status: 'read',
    },
  ],
  'user-superadmin': [
    {
      id: 'm-sa-1',
      senderId: 'user-superadmin',
      senderName: 'Superadmin (Geoinfocom)',
      senderRole: 'Superadmin',
      senderOrg: 'Geoinfocom',
      text: 'Barcha serverlar va UZKAD API shlyuzlari barqaror rejimda ishlamoqda. Geo-server javob tezligi: 42ms.',
      time: '14:00',
      isOutgoing: false,
      status: 'read',
    },
  ],
};

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<TelegramContact[]>(defaultContacts);
  const [activeContactId, setActiveContactId] = useState<string>('user-republic');
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(initialThreadMessages);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'staff' | 'groups'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];
  const currentMessages = allMessages[activeContactId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [allMessages, activeContactId, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string, imageToSend?: string, fileToSend?: { name: string; size: string; type: string }) => {
    const finalContent = textToSend ?? inputText.trim();
    if (!finalContent && !imageToSend && !fileToSend) return;

    const newMsgId = `m-out-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: newMsgId,
      senderId: 'my-user',
      senderName: user?.fullName || 'Bilolov Elyor (Siz)',
      senderRole: 'Admin',
      senderOrg: 'Kadastr agentligi',
      text: finalContent || undefined,
      image: imageToSend,
      file: fileToSend,
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      status: 'sent',
    };

    setAllMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg],
    }));

    if (!imageToSend && !fileToSend) {
      setInputText('');
    }
    setShowAttachMenu(false);

    // Simulate tick status update (sent -> delivered -> read)
    setTimeout(() => {
      setAllMessages(prev => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).map(m =>
          m.id === newMsgId ? { ...m, status: 'read' } : m
        ),
      }));
    }, 700);

    // Trigger counterpart typing and realistic reply
    setIsTyping(true);
    setTimeout(() => {
      let replyResponse = `Murojaatingiz va yuborilgan ma'lumot qabul qilindi. Reestr reglamenti bo'yicha ko'rib chiqilmoqda.`;
      const lower = (finalContent || '').toLowerCase();

      if (imageToSend) {
        replyResponse = `Yuborgan rasmingiz/chizmani ko'rib chiqdim. Geofazoviy kirish nuqtasi va fasad koordinatalari to'g'ri ko'rsatilgan, tasdiqlash uchun qabul qilindi.`;
      } else if (fileToSend) {
        replyResponse = `"${fileToSend.name}" hujjati muvaffaqiyatli yuklandi. Kadastr xatlov dalolatnomasi reestrga biriktirildi.`;
      } else if (lower.includes('manzil') || lower.includes('ariza') || lower.includes('tasdiq')) {
        replyResponse = `Arizangiz tekshirildi. Manzil yaratish/o'zgartirish talablariga muvofiq barcha maydonlar to'ldirilgan. ERI bilan imzolash bosqichiga o'tkazildi.`;
      } else if (lower.includes('xarita') || lower.includes('hudud') || lower.includes('koordinata')) {
        replyResponse = `O'zbekiston xaritasidagi geofazoviy chegaralar (WGS-84) va binoning kirish nuqtasi (50m ichida) to'g'ri bog'langan.`;
      } else if (lower.includes('uzkad') || lower.includes('integratsiya')) {
        replyResponse = `UZKAD bazasi bilan to'g'ridan-to'g'ri sinxronizatsiya o'rnatilgan. Manzil kadastr raqamiga avtomatik biriktiriladi.`;
      } else {
        replyResponse = `Xabaringiz uchun rahmat. ${activeContact.name} (${activeContact.roleName}) murojaat bo'yicha zarur amallarni tizimda belgiladi.`;
      }

      const counterpartReply: ChatMessage = {
        id: `m-in-${Date.now()}`,
        senderId: activeContact.id,
        senderName: activeContact.name,
        senderRole: activeContact.roleName,
        senderOrg: activeContact.organization,
        text: replyResponse,
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        isOutgoing: false,
        status: 'read',
      };

      setAllMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), counterpartReply],
      }));
      setIsTyping(false);
    }, 1500);
  };

  // Sample photo choices
  const samplePhotos = [
    { title: 'Bino fasadi va kirish nuqtasi', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
    { title: 'Kadastr uchastkasi xaritasi', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80' },
    { title: 'Topografik geodeziya sxemasi', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
  ];

  // Sample files
  const sampleDocs = [
    { name: 'Arizaning_topografik_sxemasi.pdf', size: '2.4 MB', type: 'application/pdf' },
    { name: 'Xatlov_dalolatnomasi_DKP.docx', size: '540 KB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'Bino_kirish_koordinatalari.xlsx', size: '120 KB', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  ];

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = event => {
        handleSendMessage(undefined, event.target?.result as string, undefined);
      };
      reader.readAsDataURL(file);
    } else {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
      handleSendMessage(undefined, undefined, {
        name: file.name,
        size: sizeStr,
        type: file.type || 'Hujjat',
      });
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organization.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterCategory === 'groups') return c.id.startsWith('grp');
    if (filterCategory === 'staff') return !c.id.startsWith('grp');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Inter',sans-serif]">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen
            ? 'w-[98vw] h-[96vh]'
            : 'w-full max-w-5xl h-[680px]'
        }`}
      >
        {/* 1. TOP TELEGRAM HEADER */}
        <div className="bg-[#2481cc] text-white px-4 py-3 flex items-center justify-between shadow-sm select-none">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shadow-xs">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-sm tracking-tight text-white">
                  Kadastr Texnik Ko'mak Messenjeri
                </h2>
                <span className="bg-white/20 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white">
                  Telegram uslubida
                </span>
              </div>
              <p className="text-[11px] text-blue-100 flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>O'zbekiston Respublikasi Davlat kadastrlari palatasi axborot tarmog'i</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              title={isFullScreen ? "Kichik oyna" : "To'liq ekran"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. MAIN WORKSPACE: LEFT CONTACTS + RIGHT CHAT */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL: CONTACTS / SPECIALISTS LIST */}
          <div className="w-80 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
            {/* Search Box */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Mutaxassis yoki guruhni qidirish..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 mt-2.5 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`flex-1 py-1 rounded-md font-medium transition-all ${
                    filterCategory === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setFilterCategory('staff')}
                  className={`flex-1 py-1 rounded-md font-medium transition-all ${
                    filterCategory === 'staff' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Mutaxassislar
                </button>
                <button
                  onClick={() => setFilterCategory('groups')}
                  className={`flex-1 py-1 rounded-md font-medium transition-all ${
                    filterCategory === 'groups' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Guruhlar
                </button>
              </div>
            </div>

            {/* Contacts Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {filteredContacts.map(contact => {
                const isSelected = contact.id === activeContactId;
                const contactMsgs = allMessages[contact.id] || [];
                const lastMsg = contactMsgs[contactMsgs.length - 1];

                return (
                  <div
                    key={contact.id}
                    onClick={() => setActiveContactId(contact.id)}
                    className={`p-3 flex items-start space-x-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#eff6ff] border-l-4 border-[#2481cc]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Contact Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-full ${contact.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                        {contact.initials}
                      </div>
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {contact.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lastMsg ? lastMsg.time : '17:00'}
                        </span>
                      </div>

                      {/* Role & Org Badge */}
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100 truncate">
                          {contact.roleName}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          • {contact.organization}
                        </span>
                      </div>

                      {/* Last message snippet */}
                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {lastMsg?.image ? '📷 [Rasm]' : lastMsg?.file ? `📄 ${lastMsg.file.name}` : lastMsg?.text || 'Yangi suhbat...'}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {contact.unreadCount > 0 && !isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#2481cc] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-2">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: TELEGRAM CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden">
            {/* Chat Top Bar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full ${activeContact.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                    {activeContact.initials}
                  </div>
                  {activeContact.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                    <span>{activeContact.name}</span>
                    <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {activeContact.roleName} • {activeContact.organization}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    {activeContact.isOnline ? (
                      <span className="text-emerald-600 font-medium">onlayn</span>
                    ) : (
                      <span>{activeContact.statusText}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 text-slate-600">
                <button
                  type="button"
                  onClick={() => alert("Kadastr xizmati qo'ng'iroq shlyuzi faol.")}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                  title="Qo'ng'iroq qilish"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => alert("Video konferensiya shlyuzi faol.")}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                  title="Videomuloqot"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body (Telegram styled background) */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage: "radial-gradient(#cbd5e1 0.75px, transparent 0.75px)",
                backgroundSize: "20px 20px"
              }}
            >
              {/* Day divider */}
              <div className="text-center my-2">
                <span className="bg-slate-200/80 text-slate-600 text-[10px] px-3 py-1 rounded-full font-medium shadow-2xs backdrop-blur-xs">
                  Bugun, 21-oktyabr 2026
                </span>
              </div>

              {currentMessages.map(msg => {
                const isMe = msg.isOutgoing;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {!isMe && (
                      <div className="flex items-center space-x-1.5 px-1">
                        <span className="font-bold text-[11px] text-[#2481cc]">
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] text-slate-400 bg-white/70 px-1.5 py-0.2 rounded border border-slate-200">
                          {msg.senderRole}
                        </span>
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 shadow-xs leading-relaxed relative ${
                        isMe
                          ? 'bg-[#eff6ff] text-slate-900 rounded-br-xs border border-blue-100'
                          : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200'
                      }`}
                    >
                      {/* Attached Image */}
                      {msg.image && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-w-sm cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setPreviewImage(msg.image!)}>
                          <img
                            src={msg.image}
                            alt="Biriktirilgan rasm"
                            className="w-full h-auto max-h-60 object-cover"
                          />
                          <div className="p-1.5 bg-slate-900/60 text-white text-[10px] flex items-center justify-between">
                            <span>📷 Rasm / Kadastr chizmasi</span>
                            <span className="text-[9px] underline">Kattalashtirish</span>
                          </div>
                        </div>
                      )}

                      {/* Attached Document File */}
                      {msg.file && (
                        <div className="mb-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between space-x-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-slate-800 truncate">
                                {msg.file.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {msg.file.size} • {msg.file.type}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert(`"${msg.file?.name}" hujjati yuklab olindi.`)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
                            title="Yuklab olish"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Text content */}
                      {msg.text && (
                        <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {/* Time and Status checkmarks */}
                      <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-slate-400 font-mono">
                        <span>{msg.time}</span>
                        {isMe && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#2481cc]" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs w-fit text-slate-500 text-xs italic">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></span>
                  <span>{activeContact.name} yozmoqda...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* BOTTOM INPUT BAR (Telegram Desktop layout) */}
            <div className="p-3 bg-white border-t border-slate-200 relative">
              {/* Attachment Popup Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-16 left-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 w-64 z-20 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Biriktirish
                  </div>

                  {/* Real Photo Upload from PC */}
                  <label className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs text-slate-700">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Kompyuterdan rasm yuklash</span>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {/* Real Document Upload from PC */}
                  <label className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs text-slate-700">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Hujjat / Fayl yuklash</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <div className="border-t border-slate-100 my-1"></div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Kadastr namunalari
                  </div>

                  {samplePhotos.map(p => (
                    <button
                      key={p.title}
                      onClick={() => handleSendMessage(undefined, p.url, undefined)}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-[11px] text-slate-700 truncate"
                    >
                      📷 {p.title}
                    </button>
                  ))}

                  {sampleDocs.map(d => (
                    <button
                      key={d.name}
                      onClick={() => handleSendMessage(undefined, undefined, d)}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-[11px] text-slate-700 truncate"
                    >
                      📄 {d.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2">
                {/* Attachment Paperclip Button */}
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    showAttachMenu
                      ? 'bg-blue-100 text-[#2481cc]'
                      : 'hover:bg-slate-100 text-slate-500'
                  }`}
                  title="Fayl yoki rasm biriktirish"
                >
                  <Paperclip className="w-5 h-5 -rotate-45" />
                </button>

                {/* Text Input Field */}
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Xabarni yozing..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-[#2481cc] focus:bg-white transition-all"
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-[#2481cc] hover:bg-blue-600 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-sm"
                  title="Jo'natish (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for zooming attached photo */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-black rounded-xl overflow-hidden">
            <img src={previewImage} alt="Kattalashtirilgan rasm" className="w-full h-auto object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
