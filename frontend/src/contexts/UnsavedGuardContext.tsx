import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'

interface UnsavedGuardContextValue {
  /**
   * Dipanggil halaman form (mis. CreateEventPage) tiap kali status "ada isian
   * belum disimpan" berubah. `onConfirmLeave` opsional dijalankan sekali kalau
   * user memilih tetap pindah halaman (mis. buat bersihkan draft localStorage-nya).
   */
  setGuard: (active: boolean, onConfirmLeave?: () => void) => void
  /** Dipakai elemen navigasi (sidebar/footer) — jalankan `action` langsung kalau tidak ada guard aktif, atau tampilkan konfirmasi dulu kalau ada. */
  guardedAction: (action: () => void) => void
}

const UnsavedGuardContext = createContext<UnsavedGuardContextValue | null>(null)

/**
 * Guard navigasi generik: satu provider dipasang di layout (mis. OrganizerLayout)
 * yang membungkus sidebar/nav DAN halaman route-nya sendiri, supaya link navigasi
 * bisa menahan diri kalau halaman aktif sedang menandai ada perubahan belum tersimpan.
 * Tidak pakai react-router useBlocker krn app ini masih pakai <BrowserRouter> biasa
 * (bukan data router) — lihat CLAUDE.md Section "Struktur Repo".
 */
export function UnsavedGuardProvider({ children }: { children: ReactNode }) {
  const activeRef = useRef(false)
  const onConfirmLeaveRef = useRef<(() => void) | undefined>(undefined)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const setGuard = useCallback((active: boolean, onConfirmLeave?: () => void) => {
    activeRef.current = active
    onConfirmLeaveRef.current = onConfirmLeave
  }, [])

  const guardedAction = useCallback((action: () => void) => {
    if (activeRef.current) {
      setPendingAction(() => action)
    } else {
      action()
    }
  }, [])

  return (
    <UnsavedGuardContext.Provider value={{ setGuard, guardedAction }}>
      {children}
      {pendingAction && (
        <ConfirmDialog
          title="Tinggalkan halaman ini?"
          message="Data yang sudah kamu isi di form ini akan hilang kalau kamu pindah halaman sekarang."
          confirmLabel="Ya, Tinggalkan"
          tone="danger"
          onConfirm={() => {
            activeRef.current = false
            const action = pendingAction
            setPendingAction(null)
            onConfirmLeaveRef.current?.()
            action()
          }}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </UnsavedGuardContext.Provider>
  )
}

export function useUnsavedGuard(): UnsavedGuardContextValue {
  const ctx = useContext(UnsavedGuardContext)
  if (!ctx) {
    throw new Error('useUnsavedGuard harus dipakai di dalam UnsavedGuardProvider')
  }
  return ctx
}
