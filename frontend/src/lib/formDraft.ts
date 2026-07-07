const PREFIX = 'activibe:draft:'

// Draft form lokal (localStorage) — dipakai supaya isian form yang belum
// disubmit tetap ada walau user refresh/pindah halaman, sampai user sendiri
// menekan tombol "Buang Perubahan". Bukan hook krn bentuk state tiap form
// beda-beda (flat useState per field vs wizard multi-step) — tiap form cukup
// panggil ketiga fungsi ini sendiri, tidak dipaksa ke satu bentuk state.
export function loadDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function saveDraft<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // localStorage penuh / private browsing mode — draft gagal diam-diam,
    // bukan tanggung jawab kritikal form manapun yang memakainya.
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // no-op
  }
}
