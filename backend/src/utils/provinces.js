// Tabel 34 provinsi Indonesia dipakai untuk mencocokkan field lokasi bebas teks
// (Organization.location, Profile.location, Event.location — belum ada field
// provinsi baku di skema) ke provinsi resmi untuk peta Region Distribution.
// `geoName` HARUS persis sama dengan properti `Propinsi` di
// frontend/src/utils/geo/indonesia.geo.json supaya choropleth-nya bisa mewarnai
// provinsi itu (lihat GenericMap.tsx `nameProperty: 'Propinsi'`).
//
// Ini pencocokan kata kunci/alias, BUKAN geocoding presisi — teks yang tidak
// mengandung provinsi atau kota besarnya sama sekali tidak akan cocok ke
// provinsi mana pun (lihat matchProvince).
export const PROVINCES = [
  { geoName: 'DKI JAKARTA', displayName: 'DKI Jakarta', aliases: ['dki jakarta', 'jakarta'] },
  { geoName: 'JAWA BARAT', displayName: 'Jawa Barat', aliases: ['jawa barat', 'bandung', 'bekasi', 'bogor', 'depok', 'cimahi', 'sukabumi', 'cirebon', 'tasikmalaya', 'karawang'] },
  { geoName: 'JAWA TENGAH', displayName: 'Jawa Tengah', aliases: ['jawa tengah', 'semarang', 'solo', 'surakarta', 'magelang', 'pekalongan', 'tegal', 'purwokerto'] },
  { geoName: 'JAWA TIMUR', displayName: 'Jawa Timur', aliases: ['jawa timur', 'surabaya', 'malang', 'kediri', 'sidoarjo', 'jember', 'madiun'] },
  { geoName: 'DAERAH ISTIMEWA YOGYAKARTA', displayName: 'DI Yogyakarta', aliases: ['daerah istimewa yogyakarta', 'yogyakarta', 'jogja', 'diy', 'sleman', 'bantul'] },
  { geoName: 'BANTEN', displayName: 'Banten', aliases: ['banten', 'tangerang', 'serang', 'cilegon'] },
  { geoName: 'BALI', displayName: 'Bali', aliases: ['bali', 'denpasar', 'badung', 'ubud'] },
  { geoName: 'KEPULAUAN RIAU', displayName: 'Kepulauan Riau', aliases: ['kepulauan riau', 'kepri', 'batam', 'tanjungpinang'] },
  { geoName: 'RIAU', displayName: 'Riau', aliases: ['riau', 'pekanbaru'] },
  { geoName: 'SUMATERA UTARA', displayName: 'Sumatera Utara', aliases: ['sumatera utara', 'sumut', 'medan'] },
  { geoName: 'SUMATERA BARAT', displayName: 'Sumatera Barat', aliases: ['sumatera barat', 'sumbar', 'padang'] },
  { geoName: 'SUMATERA SELATAN', displayName: 'Sumatera Selatan', aliases: ['sumatera selatan', 'sumsel', 'palembang'] },
  { geoName: 'BANGKA BELITUNG', displayName: 'Bangka Belitung', aliases: ['bangka belitung', 'babel', 'pangkal pinang', 'pangkalpinang'] },
  { geoName: 'JAMBI', displayName: 'Jambi', aliases: ['jambi'] },
  { geoName: 'LAMPUNG', displayName: 'Lampung', aliases: ['lampung', 'bandar lampung'] },
  { geoName: 'BENGKULU', displayName: 'Bengkulu', aliases: ['bengkulu'] },
  { geoName: 'DI. ACEH', displayName: 'Aceh', aliases: ['aceh', 'nanggroe aceh darussalam', 'banda aceh'] },
  { geoName: 'KALIMANTAN BARAT', displayName: 'Kalimantan Barat', aliases: ['kalimantan barat', 'kalbar', 'pontianak'] },
  { geoName: 'KALIMANTAN TENGAH', displayName: 'Kalimantan Tengah', aliases: ['kalimantan tengah', 'kalteng', 'palangka raya', 'palangkaraya'] },
  { geoName: 'KALIMANTAN SELATAN', displayName: 'Kalimantan Selatan', aliases: ['kalimantan selatan', 'kalsel', 'banjarmasin'] },
  { geoName: 'KALIMANTAN TIMUR', displayName: 'Kalimantan Timur', aliases: ['kalimantan timur', 'kaltim', 'samarinda', 'balikpapan'] },
  { geoName: 'KALIMANTAN UTARA', displayName: 'Kalimantan Utara', aliases: ['kalimantan utara', 'kaltara', 'tanjung selor'] },
  { geoName: 'SULAWESI UTARA', displayName: 'Sulawesi Utara', aliases: ['sulawesi utara', 'sulut', 'manado'] },
  { geoName: 'SULAWESI TENGAH', displayName: 'Sulawesi Tengah', aliases: ['sulawesi tengah', 'sulteng', 'palu'] },
  { geoName: 'SULAWESI SELATAN', displayName: 'Sulawesi Selatan', aliases: ['sulawesi selatan', 'sulsel', 'makassar'] },
  { geoName: 'SULAWESI TENGGARA', displayName: 'Sulawesi Tenggara', aliases: ['sulawesi tenggara', 'sultra', 'kendari'] },
  { geoName: 'SULAWESI BARAT', displayName: 'Sulawesi Barat', aliases: ['sulawesi barat', 'sulbar', 'mamuju'] },
  { geoName: 'GORONTALO', displayName: 'Gorontalo', aliases: ['gorontalo'] },
  { geoName: 'MALUKU', displayName: 'Maluku', aliases: ['maluku', 'ambon'] },
  { geoName: 'MALUKU UTARA', displayName: 'Maluku Utara', aliases: ['maluku utara', 'malut', 'ternate'] },
  { geoName: 'PAPUA', displayName: 'Papua', aliases: ['papua', 'jayapura'] },
  { geoName: 'PAPUA BARAT', displayName: 'Papua Barat', aliases: ['papua barat', 'manokwari'] },
  { geoName: 'NUSA TENGGARA BARAT', displayName: 'Nusa Tenggara Barat', aliases: ['nusa tenggara barat', 'ntb', 'mataram', 'lombok'] },
  { geoName: 'NUSA TENGGARA TIMUR', displayName: 'Nusa Tenggara Timur', aliases: ['nusa tenggara timur', 'ntt', 'kupang'] },
]

/**
 * Cocokkan teks lokasi bebas ke satu provinsi via alias terpanjang yang
 * cocok (mis. "Kepulauan Riau" menang dibanding "Riau" untuk teks yang
 * mengandung keduanya). Return null kalau tidak ada alias yang cocok sama
 * sekali — entri itu tidak dihitung di provinsi mana pun.
 */
export function matchProvince(locationText) {
  if (!locationText || typeof locationText !== 'string') return null
  const text = locationText.toLowerCase()

  let best = null
  let bestAliasLength = 0
  for (const province of PROVINCES) {
    for (const alias of province.aliases) {
      if (text.includes(alias) && alias.length > bestAliasLength) {
        best = province
        bestAliasLength = alias.length
      }
    }
  }
  return best
}
