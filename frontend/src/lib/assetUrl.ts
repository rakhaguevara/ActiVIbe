const API_URL = import.meta.env.VITE_API_URL ?? ''

// Backend mengembalikan URL upload relatif (`/uploads/...`) yang di-serve
// dari origin backend, bukan origin dev server frontend — perlu di-prefix
// API_URL supaya <img>/link tidak salah resolve ke origin frontend.
export function resolveAssetUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_URL}${url}`
}
