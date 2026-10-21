import React, { useState, useEffect, useMemo } from 'react';
import { Address } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface RegistryPageProps {
  onSelectAddress: (addr: Address) => void;
  onOpenCertificate: (addrId: string) => void;
  onOpenCancellation: (addr: Address) => void;
  onNavigateToMap: (addr: Address) => void;
}

const UZBEKISTAN_REGIONS = [
  'Surxondaryo viloyati',
  'Xorazm viloyati',
  'Qoraqalpog\'iston Respublikasi',
  'Samarqand viloyati',
  'Farg\'ona viloyati',
  'Qashqadaryo viloyati',
  'Namangan viloyati',
  'Toshkent shahri',
  'Toshkent viloyati',
  'Andijon viloyati',
  'Buxoro viloyati',
  'Jizzax viloyati',
  'Navoiy viloyati',
  'Sirdaryo viloyati',
];

export const RegistryPage: React.FC<RegistryPageProps> = ({
  onSelectAddress,
  onOpenCertificate,
  onOpenCancellation,
  onNavigateToMap,
}) => {
  const { role } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters matching screenshot
  const [cadastreFilter, setCadastreFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [mahallaFilter, setMahallaFilter] = useState('all');
  const [streetFilter, setStreetFilter] = useState('all');
  const [houseNumberFilter, setHouseNumberFilter] = useState('');
  const [usageTypeFilter, setUsageTypeFilter] = useState('all');

  // Pagination (default: 20 as requested)
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAddresses();
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
  }, []);

  // Filtered lists for dropdowns
  const availableDistricts = useMemo(() => {
    const list = addresses
      .filter(a => regionFilter === 'all' || a.region === regionFilter)
      .map(a => a.district)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [addresses, regionFilter]);

  const availableMahallas = useMemo(() => {
    const list = addresses
      .filter(a => (regionFilter === 'all' || a.region === regionFilter) && (districtFilter === 'all' || a.district === districtFilter))
      .map(a => (a as any).mahalla)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [addresses, regionFilter, districtFilter]);

  const availableStreets = useMemo(() => {
    const list = addresses
      .filter(a => (regionFilter === 'all' || a.region === regionFilter) && (districtFilter === 'all' || a.district === districtFilter))
      .map(a => a.streetName)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [addresses, regionFilter, districtFilter]);

  const availableUsageTypes = useMemo(() => {
    const list = addresses.map(a => (a as any).usageType || a.objectType).filter(Boolean);
    return Array.from(new Set(list));
  }, [addresses]);

  // Filter addresses according to the top filters
  const filteredAddresses = useMemo(() => {
    return addresses.filter(item => {
      if (cadastreFilter.trim()) {
        const term = cadastreFilter.trim().toLowerCase();
        if (!item.cadastreNumber.toLowerCase().includes(term)) {
          return false;
        }
      }
      if (regionFilter !== 'all' && item.region !== regionFilter) {
        return false;
      }
      if (districtFilter !== 'all' && item.district !== districtFilter) {
        return false;
      }
      if (mahallaFilter !== 'all') {
        const itemMahalla = (item as any).mahalla || '';
        if (!itemMahalla.toLowerCase().includes(mahallaFilter.toLowerCase())) {
          return false;
        }
      }
      if (streetFilter !== 'all') {
        if (!item.streetName.toLowerCase().includes(streetFilter.toLowerCase())) {
          return false;
        }
      }
      if (houseNumberFilter.trim()) {
        const term = houseNumberFilter.trim().toLowerCase();
        if (!item.houseNumber.toLowerCase().includes(term)) {
          return false;
        }
      }
      if (usageTypeFilter !== 'all') {
        const itemUsage = (item as any).usageType || item.objectType;
        if (itemUsage !== usageTypeFilter) {
          return false;
        }
      }
      return true;
    });
  }, [
    addresses,
    cadastreFilter,
    regionFilter,
    districtFilter,
    mahallaFilter,
    streetFilter,
    houseNumberFilter,
    usageTypeFilter,
  ]);

  // Pagination calculation
  const totalItems = filteredAddresses.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filteredAddresses.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    cadastreFilter,
    regionFilter,
    districtFilter,
    mahallaFilter,
    streetFilter,
    houseNumberFilter,
    usageTypeFilter,
    pageSize,
  ]);

  // Export to Excel / CSV based on current filters
  const handleDownloadExcel = () => {
    const listToExport = filteredAddresses.length > 0 ? filteredAddresses : addresses;

    if (listToExport.length === 0) {
      alert("Eksport qilish uchun filtr bo'yicha manzillar topilmadi.");
      return;
    }

    const headers = [
      'Kadastr raqami',
      'Hudud',
      'Tuman',
      'Mahalla',
      'Ko\'cha',
      'Uy raqami',
      'Foydalanish turi',
      'Manba',
      'Unikal Geokod',
      'To\'liq manzil (Lotin)',
      'Holati',
    ];

    const rows = listToExport.map(a => [
      `"${a.cadastreNumber || ''}"`,
      `"${a.region || ''}"`,
      `"${a.district || ''}"`,
      `"${(a as any).mahalla || ''}"`,
      `"${a.streetName || ''}"`,
      `"${a.houseNumber || ''}"`,
      `"${(a as any).usageType || a.objectType || ''}"`,
      `"${(a as any).source || 'UZKAD'}"`,
      `"${a.geocode || ''}"`,
      `"${a.fullAddressUz || ''}"`,
      `"${a.status === 'active' ? 'Faol' : 'Bekor qilingan'}"`,
    ]);

    // CSV format with UTF-8 BOM so Excel opens it directly without encoding issues
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeRegion = regionFilter === 'all' ? 'barcha_hududlar' : regionFilter.replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `Manzillar_Reestri_${safeRegion}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        
        {/* Title & Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 tracking-wide uppercase">
            REYESTR
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadExcel}
              title="Tanlangan parametrlar bo'yicha Excel formatida yuklab olish"
              className="bg-[#107c41] hover:bg-[#0b5c30] text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span>Excel ko'rinishida yuklash</span>
            </button>

            <button
              onClick={loadData}
              title="Yangilash"
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Bar (1:1 with user screenshot + Uy raqami) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* 1. Kadastr raqami */}
          <div>
            <input
              type="text"
              value={cadastreFilter}
              onChange={e => setCadastreFilter(e.target.value)}
              placeholder="Kadastr raqami"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 2. Hudud */}
          <div>
            <select
              value={regionFilter}
              onChange={e => {
                setRegionFilter(e.target.value);
                setDistrictFilter('all');
                setMahallaFilter('all');
                setStreetFilter('all');
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">Hudud</option>
              {UZBEKISTAN_REGIONS.map(reg => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Tuman */}
          <div>
            <select
              value={districtFilter}
              onChange={e => {
                setDistrictFilter(e.target.value);
                setMahallaFilter('all');
                setStreetFilter('all');
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">Tuman</option>
              {availableDistricts.map(dist => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Mahalla */}
          <div>
            <select
              value={mahallaFilter}
              onChange={e => setMahallaFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">Mahalla</option>
              {availableMahallas.map(mah => (
                <option key={mah} value={mah}>
                  {mah}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Ko'chalar */}
          <div>
            <select
              value={streetFilter}
              onChange={e => setStreetFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">Ko'chalar</option>
              {availableStreets.map(str => (
                <option key={str} value={str}>
                  {str}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Uy raqami */}
          <div>
            <input
              type="text"
              value={houseNumberFilter}
              onChange={e => setHouseNumberFilter(e.target.value)}
              placeholder="Uy raqami"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white font-medium"
            />
          </div>

          {/* 7. Foydalanish turi */}
          <div>
            <select
              value={usageTypeFilter}
              onChange={e => setUsageTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">Foydalanish turi</option>
              {availableUsageTypes.map(ut => (
                <option key={ut} value={ut}>
                  {ut}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View matching user screenshot */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8fafc] text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-bold whitespace-nowrap">Kadastr raqami</th>
                  <th className="py-3 px-3.5 font-bold whitespace-nowrap">Hudud</th>
                  <th className="py-3 px-3.5 font-bold whitespace-nowrap">Tuman</th>
                  <th className="py-3 px-3.5 font-bold whitespace-nowrap">Mahalla</th>
                  <th className="py-3 px-3.5 font-bold whitespace-nowrap">Ko'cha</th>
                  <th className="py-3 px-3.5 font-bold whitespace-nowrap">Foydalanish turi</th>
                  <th className="py-3 px-3.5 font-bold whitespace-nowrap">Uy raqami</th>
                  <th className="py-3 px-3.5 font-bold whitespace-nowrap">Manba</th>
                  <th className="py-3 px-3.5 text-center font-bold whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Ma'lumotlar yuklanmoqda...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tanlangan parametrlar bo'yicha manzil ma'lumotlari topilmadi
                    </td>
                  </tr>
                ) : (
                  currentItems.map(addr => (
                    <tr key={addr.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* Kadastr raqami */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap font-normal">
                        <button
                          onClick={() => onOpenCertificate(addr.id)}
                          className="text-[#2563eb] hover:underline hover:text-blue-700 text-left cursor-pointer"
                        >
                          {addr.cadastreNumber}
                        </button>
                      </td>

                      {/* Hudud */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700">
                        {addr.region}
                      </td>

                      {/* Tuman */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700">
                        {addr.district}
                      </td>

                      {/* Mahalla */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700">
                        {(addr as any).mahalla || '-'}
                      </td>

                      {/* Ko'cha */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700">
                        {addr.streetName}
                      </td>

                      {/* Foydalanish turi */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700">
                        {(addr as any).usageType || (addr.objectType === 'noturar' ? 'Noturar' : 'Yakka tartibdagi turar joylar')}
                      </td>

                      {/* Uy raqami */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700 font-medium">
                        {addr.houseNumber}
                      </td>

                      {/* Manba */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-600">
                        {(addr as any).source || 'UZKAD'}
                      </td>

                      {/* Amallar (Eye button) */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => onOpenCertificate(addr.id)}
                          title="Manzil to'g'risidagi ma'lumotnoma va ko'rish"
                          className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-[#3b82f6] text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination & Bottom Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Page size selector (Default: 20) */}
          <div className="flex items-center space-x-2">
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-slate-400">
              Jami: {totalItems} ta manzil ({totalItems > 0 ? startIndex + 1 : 0} - {endIndex})
            </span>
          </div>

          {/* Prev / Next controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium flex items-center space-x-1 ${
                currentPage === 1
                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-50 text-slate-700 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Oldingi</span>
            </button>

            <span className="px-2 text-xs font-semibold text-slate-600">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium flex items-center space-x-1 ${
                currentPage === totalPages
                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-50 text-slate-700 cursor-pointer'
              }`}
            >
              <span>Keyingi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Excel ko'rinishida yuklash tugmasi */}
          <div>
            <button
              onClick={handleDownloadExcel}
              className="w-full sm:w-auto bg-[#107c41] hover:bg-[#0b5c30] active:bg-[#084524] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Excel ko'rinishida yuklash</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
