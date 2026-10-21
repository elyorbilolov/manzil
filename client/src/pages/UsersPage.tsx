import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Lock,
  Unlock,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Shield,
  Building2,
  CheckCircle2
} from 'lucide-react';

const officialRoles = [
  { no: 1, name: 'Superadmin', code: 'Super_admin', status: 'Faol', org: 'Geoinfocom', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { no: 2, name: 'Admin', code: 'admin', status: 'Faol', org: 'Kadastr agentligi', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { no: 3, name: 'Respublika xodim', code: 'republic_staff', status: 'Faol', org: 'DKP Respublika', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { no: 4, name: 'Viloyat xodim', code: 'region_staff', status: 'Faol', org: 'DKP boshqarma', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { no: 5, name: 'Tuman raxbar', code: 'district_chief', status: 'Faol', org: 'DKP tuman', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { no: 6, name: 'Tuman xodim', code: 'district_staff', status: 'Faol', org: 'DKP tuman', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
];

const roleNames: Record<UserRole, string> = {
  RESPUBLIKA_DKP_MM: 'Respublika xodim (DKP Respublika)',
  HUDUD_DKP_MM: 'Viloyat xodim (DKP boshqarma)',
  FILIAL_RAHBARI_DKP: 'Tuman raxbar (DKP tuman)',
  FILIAL_DKP_MM: 'Tuman xodim (DKP tuman)',
  ADMIN: 'Admin (Kadastr agentligi)',
  INSPECTOR: 'Nazoratchi / mas\'ul xodim',
  CITIZEN: 'Kuzatuvchi / Tinglovchi (Fuqaro)',
};

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');

  // New user form
  const [fullName, setFullName] = useState('');
  const [pinfl, setPinfl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 90 ');
  const [role, setRole] = useState<UserRole>('FILIAL_DKP_MM');
  const [region, setRegion] = useState('Toshkent shahri');
  const [district, setDistrict] = useState('Chilonzor tumani');
  const [department, setDepartment] = useState('Filial');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success) setUsers(res.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        fullName,
        pinfl,
        email,
        phone,
        role,
        region,
        district,
        department,
      });
      setShowAddModal(false);
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.updateUser(user.id, { isActive: !user.isActive });
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Foydalanuvchilar va Rollar Boshqaruvi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mavjud 6 ta rasmiy rol, vakolatlar ierarxiyasi va tizim xodimlari ro'yxati
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'roles'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mavjud rollar (6 ta)
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xodimlar ro'yxati ({users.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi xodim</span>
          </button>
        </div>
      </div>

      {/* 1. MAVJUD ROLLAR JADVALI (EXACT FROM USER'S DOCUMENT) */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Shield className="w-5 h-5 text-blue-600" />
                <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Mavjud rollar
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Rasmiy tasdiqlangan rollar jadvali
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="py-3 px-4 w-12 border-r border-slate-200 text-center">№</th>
                    <th className="py-3 px-4 border-r border-slate-200">Nomi</th>
                    <th className="py-3 px-4 border-r border-slate-200">Kod</th>
                    <th className="py-3 px-4 border-r border-slate-200 text-center">Holat</th>
                    <th className="py-3 px-4">Tashkilot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-['Inter',sans-serif]">
                  {officialRoles.map(r => (
                    <tr key={r.no} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-500 border-r border-slate-200">
                        {r.no}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                        {r.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600 border-r border-slate-200">
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                          {r.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center border-r border-slate-200">
                        <span className="inline-block px-2.5 py-0.5 rounded border border-emerald-400 text-emerald-600 font-bold text-[11px] bg-emerald-50/50">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {r.org}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Permissions Overview */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ruxsatlar va Vakolatlar Matritsasi:</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-center border text-[11px]">
                <thead className="bg-slate-50 font-bold border-b">
                  <tr>
                    <th className="p-2 text-left">Rol nomi</th>
                    <th className="p-2">Tashkilot</th>
                    <th className="p-2">Manzil yaratish</th>
                    <th className="p-2">Kirish nuqtasi &lt;50m</th>
                    <th className="p-2">Tuman tasdig'i</th>
                    <th className="p-2">Viloyat kelishuvi</th>
                    <th className="p-2">Respublika tasdig'i</th>
                    <th className="p-2">Texnik ko'mak chati</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2 text-left font-bold text-cyan-800">Tuman xodim (district_staff)</td>
                    <td className="p-2 text-slate-500">DKP tuman</td>
                    <td className="p-2 text-emerald-600 font-bold">✓ (Yaratish)</td>
                    <td className="p-2 text-emerald-600 font-bold">✓ (Aniqlash)</td>
                    <td className="p-2 text-slate-300">-</td>
                    <td className="p-2 text-slate-300">-</td>
                    <td className="p-2 text-slate-300">-</td>
                    <td className="p-2 text-blue-600 font-bold">✓ (Sms, rasm, fayl)</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-bold text-amber-800">Tuman raxbar (district_chief)</td>
                    <td className="p-2 text-slate-500">DKP tuman</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓ (ERI Imzo)</td>
                    <td className="p-2 text-slate-300">-</td>
                    <td className="p-2 text-slate-300">-</td>
                    <td className="p-2 text-blue-600 font-bold">✓ (Sms, rasm, fayl)</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-bold text-purple-800">Viloyat xodim (region_staff)</td>
                    <td className="p-2 text-slate-500">DKP boshqarma</td>
                    <td className="p-2 text-emerald-600 font-bold">✓ (Nazorat)</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-slate-300">-</td>
                    <td className="p-2 text-emerald-600 font-bold">✓ (Kelishish)</td>
                    <td className="p-2 text-slate-300">-</td>
                    <td className="p-2 text-blue-600 font-bold">✓ (Sms, rasm, fayl)</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-bold text-emerald-800">Respublika xodim (republic_staff)</td>
                    <td className="p-2 text-slate-500">DKP Respublika</td>
                    <td className="p-2 text-emerald-600 font-bold">✓ (To'liq)</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓ (Yakuniy ERI)</td>
                    <td className="p-2 text-blue-600 font-bold">✓ (Sms, rasm, fayl)</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-bold text-blue-800">Admin (admin)</td>
                    <td className="p-2 text-slate-500">Kadastr agentligi</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-blue-600 font-bold">✓ (Boshqaruv)</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-bold text-rose-800">Superadmin (Super_admin)</td>
                    <td className="p-2 text-slate-500">Geoinfocom</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-emerald-600 font-bold">✓</td>
                    <td className="p-2 text-blue-600 font-bold">✓ (Supervizor)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. FOYDALANUVCHILAR RO'YXATI */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">F.I.Sh. va JSHSHIR</th>
                  <th className="py-3 px-4">Tizimdagi Roli</th>
                  <th className="py-3 px-4">Hudud va Tashkilot</th>
                  <th className="py-3 px-4">Aloqa</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">PINFL: {u.pinfl}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {roleNames[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">{u.region}</div>
                      <div className="text-[11px] text-slate-400">{u.district}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      <div>{u.email}</div>
                      <div className="text-slate-400">{u.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Faol
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Bloklangan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u)}
                        title={u.isActive ? 'Bloklash' : 'Faollashtirish'}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        {u.isActive ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Yangi xodim hisobini yaratish</span>
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">To'liq F.I.Sh:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Aliyev Vali Salihovich"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">JSHSHIR (14 xonali):</label>
                  <input
                    type="text"
                    value={pinfl}
                    onChange={e => setPinfl(e.target.value)}
                    placeholder="30101950000000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefon:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Elektron pochta (Email):</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="xodim@kadastr.uz"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tizimdagi roli:</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {Object.entries(roleNames).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
