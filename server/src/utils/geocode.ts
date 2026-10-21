/**
 * Geocode Generator for O'zbekiston Respublikasi Ko'chmas mulk manzillari reestri
 * Formats: UZ-[HUDUD_KOD]-[TUMAN_KOD]-[YIL]-[KETMA-KET_RAQAM]
 * Masalan: UZ-TAS-CHI-2026-004819
 */

const regionCodeMap: Record<string, string> = {
  'Toshkent shahri': 'TAS',
  'Toshkent viloyati': 'TVL',
  'Samarqand viloyati': 'SAM',
  'Farg\'ona viloyati': 'FRG',
  'Andijon viloyati': 'AND',
  'Namangan viloyati': 'NAM',
  'Buxoro viloyati': 'BUX',
  'Xorazm viloyati': 'XOR',
  'Qashqadaryo viloyati': 'QSH',
  'Surxondaryo viloyati': 'SRX',
  'Jizzax viloyati': 'JIZ',
  'Sirdaryo viloyati': 'SRD',
  'Navoiy viloyati': 'NAV',
  'Qoraqalpog\'iston Respublikasi': 'QRQ',
};

const districtCodeMap: Record<string, string> = {
  'Chilonzor tumani': 'CHI',
  'Yakkasaroy tumani': 'YAK',
  'Yunusobod tumani': 'YUN',
  'Mirzo Ulug\'bek tumani': 'MU',
  'Mirobod tumani': 'MRB',
  'Shayxontohur tumani': 'SHX',
  'Uchtepa tumani': 'UCH',
  'Olmazor tumani': 'OLM',
  'Sergeli tumani': 'SRG',
  'Yangi Hayot tumani': 'YNH',
  'Bektemir tumani': 'BKT',
  'Yashnobod tumani': 'YSH',
  'Samarqand shahri': 'SAM',
  'Buxoro shahri': 'BUX',
  'Qo\'qon shahri': 'QOQ',
  'Andijon shahri': 'AND',
  'Namangan shahri': 'NAM',
};

export function generateGeocode(region: string, district: string, sequenceNumber: number): string {
  const regCode = regionCodeMap[region] || 'UZB';
  const disCode = districtCodeMap[district] || district.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(6, '0');
  return `UZ-${regCode}-${disCode}-${year}-${seq}`;
}

/**
 * Avtomatik to'liq manzil matnini shakllantirish (Lotin, Kirill, Rus)
 */
export function formatFullAddress(data: {
  region: string;
  district: string;
  postalCode?: string;
  planningStructureType?: string;
  planningStructureName?: string;
  streetType: string;
  streetName: string;
  houseNumber: string;
  blockNumber?: string;
  unitNumber?: string;
}): { uz: string; uzCyrillic: string; ru: string } {
  const partsUz: string[] = [data.region, data.district];
  if (data.planningStructureName) partsUz.push(data.planningStructureName);
  partsUz.push(data.streetName);
  partsUz.push(`${data.houseNumber}-uy`);
  if (data.blockNumber) partsUz.push(`${data.blockNumber}-bino`);
  if (data.unitNumber) partsUz.push(`${data.unitNumber}-xonadon/obyekt`);

  const uz = partsUz.join(', ');
  // Transliteration helper for Cyrillic and Russian approximation
  const uzCyrillic = toCyrillic(uz);
  const ru = toRussian(data);

  return { uz, uzCyrillic, ru };
}

function toCyrillic(text: string): string {
  const map: Record<string, string> = {
    'sh': 'ш', 'ch': 'ч', 'yo': 'ё', 'yu': 'ю', 'ya': 'я', 'o\'': 'ў', 'g\'': 'ғ',
    'Sh': 'Ш', 'Ch': 'Ч', 'Yo': 'Ё', 'Yu': 'Ю', 'Ya': 'Я', 'O\'': 'Ў', 'G\'': 'Ғ',
    'a': 'а', 'b': 'б', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'ҳ', 'i': 'и',
    'j': 'ж', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'қ',
    'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'x': 'х', 'y': 'й', 'z': 'з',
    'A': 'А', 'B': 'Б', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Ҳ', 'I': 'И',
    'J': 'Ж', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Қ',
    'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'X': 'Х', 'Y': 'Й', 'Z': 'З',
  };

  let res = text;
  for (const [k, v] of Object.entries(map)) {
    res = res.split(k).join(v);
  }
  return res;
}

function toRussian(data: {
  region: string;
  district: string;
  planningStructureName?: string;
  streetName: string;
  houseNumber: string;
  blockNumber?: string;
  unitNumber?: string;
}): string {
  const regRu = data.region.includes('Toshkent') ? 'г. Ташкент' : data.region.replace('viloyati', 'область');
  const disRu = data.district.replace('tumani', 'район').replace('shahri', 'город');
  const items = [regRu, disRu];
  if (data.planningStructureName) items.push(data.planningStructureName);
  items.push(`ул. ${data.streetName.replace('ko\'chasi', '').replace('shoh ko\'chasi', '')}`);
  items.push(`д. ${data.houseNumber}`);
  if (data.blockNumber) items.push(`корп. ${data.blockNumber}`);
  if (data.unitNumber) items.push(`пом./кв. ${data.unitNumber}`);
  return items.join(', ');
}

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10;
}
