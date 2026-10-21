import React, { useState, useEffect } from 'react';
import { Address } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  FileSpreadsheet,
  Building,
  Award,
  MapPin,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';

interface RegistryPageProps {
  onSelectAddress: (addr: Address) => void;
  onOpenCertificate: (addrId: string) => void;
  onOpenCancellation: (addr: Address) => void;
  onNavigateToMap: (addr: Address) => void;
}

export const RegistryPage: React.FC<RegistryPageProps> = ({
  onSelectAddress,
  onOpenCertificate,
  onOpenCancellation,
  onNavigateToMap,
}) => {
  const { role } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [objectTypeFilter, setObjectTypeFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAddresses({
        q: searchQuery,
        region: regionFilter,
        status: statusFilter,
        objectType: objectTypeFilter,
      });
      if (res.success) {
        setAddresses(res.addresses);
      }
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [regionFilter, statusFilter, objectTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const exportCsv = () => {
    if (addresses.length === 0) return;
    const headers = ['Geokod', 'Kadastr_raqami', 'Viloyat', 'Tuman', 'Kucha', 'Uy', 'Turi', 'Holati'];
    const rows = addresses.map(a => [
      `"${a.geocode}"`,
      `"${a.cadastreNumber}"`,
      `"${a.region}"`,
      `"${a.district}"`,
      `"${a.streetName}"`,
      `"${a.houseNumber}"`,
      `"${a.objectType}"`,
      `"${a.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manzillar_reestri_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ko'chmas mulk obyektlari manzillari reestri
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Davlat kadastrlari palatasi tasdiqlangan manzillar ma'lumotlar bazasi (TTZ 4.2.7)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-2 shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>CSV / Excel Eksport</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Geokod, manzil, ko'cha nomi yoki kadastr raqami bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            Qidirish
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Hudud bo'yicha:</label>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
            >
              <option value="all">Barcha hududlar</option>
              <option value="Toshkent shahri">Toshkent shahri</option>
              <option value="Samarqand viloyati">Samarqand viloyati</option>
              <option value="Buxoro viloyati">Buxoro viloyati</option>
              <option value="Farg'ona viloyati">Farg'ona viloyati</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Holati bo'yicha:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
            >
              <option value="all">Barchasi (Faol & Bekor qilingan)</option>
              <option value="active">Faqat Faol manzillar</option>
              <option value="cancelled">Bekor qilingan / Arxiv</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Obyekt turi:</label>
            <select
              value={objectTypeFilter}
              onChange={e => setObjectTypeFilter(e.target.value)}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
            >
              <option value="all">Barcha turlar</option>
              <option value="turar_joy">Turar joy</option>
              <option value="noturar">Noturar bino/inshoot</option>
              <option value="yer_uchastkasi">Yer uchastkasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Addresses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase">
            Topilgan manzillar soni: <span className="text-emerald-700">{addresses.length} ta</span>
          </span>
          <span className="text-[11px] text-slate-500">
            O'zbekiston Respublikasi yagona bazasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Unikal Geokod</th>
                <th className="py-3 px-4">Kadastr raqami</th>
                <th className="py-3 px-4">Rasmiy to'liq manzil</th>
                <th className="py-3 px-4">Hudud / Tuman</th>
                <th className="py-3 px-4">Obyekt turi</th>
                <th className="py-3 px-4">Holati</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {addresses.map(addr => (
                <tr key={addr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                    {addr.geocode}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {addr.cadastreNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                    <div>{addr.fullAddressUz}</div>
                    <div className="text-[10px] text-slate-400 italic">{addr.fullAddressUzCyrillic}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{addr.region}</div>
                    <div className="text-[11px] text-slate-400">{addr.district}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                      {addr.objectType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {addr.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center w-fit space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Faol</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center w-fit space-x-1">
                        <XCircle className="w-3 h-3" />
                        <span>Bekor qilingan</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    {/* View Certificate */}
                    <button
                      onClick={() => onOpenCertificate(addr.id)}
                      title="Rasmiy ma'lumotnoma (ko'chirma) olish"
                      className="p-1.5 rounded-lg border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition-colors inline-flex items-center"
                    >
                      <Award className="w-3.5 h-3.5" />
                    </button>

                    {/* View on Map */}
                    <button
                      onClick={() => onNavigateToMap(addr)}
                      title="Xaritada ko'rish"
                      className="p-1.5 rounded-lg border border-slate-200 text-blue-700 hover:bg-blue-50 transition-colors inline-flex items-center"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>

                    {/* Propose Cancellation C-02 (staff only) */}
                    {role !== 'CITIZEN' && addr.status === 'active' && (
                      <button
                        onClick={() => onOpenCancellation(addr)}
                        title="Manzilni o'chirish taklifini kiritish (C-02)"
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
