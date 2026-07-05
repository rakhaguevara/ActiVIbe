import { Component, type ErrorInfo, type ReactNode } from 'react'
import SectionState from './SectionState'

interface SectionErrorBoundaryProps {
  children: ReactNode
}

interface SectionErrorBoundaryState {
  hasError: boolean
}

// Pertahanan tambahan di atas penanganan error fetch (lihat SectionState) —
// menangkap error saat RENDER (mis. properti nested yang di-deref langsung
// tanpa optional chaining di EventDetailPanel/OrganizationDetailPanel) supaya
// cuma panel ini yang gagal, bukan seluruh halaman.
export default class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  state: SectionErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SectionErrorBoundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <SectionState
          variant="error"
          title="Gagal menampilkan bagian ini."
          description="Coba pilih ulang atau muat ulang halaman."
        />
      )
    }
    return this.props.children
  }
}
