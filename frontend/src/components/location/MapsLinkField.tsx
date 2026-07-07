import { resolveMapsEmbed } from '../../lib/mapsEmbed'
import './MapsLinkField.css'

interface MapsLinkFieldProps {
  value: string
  onChange: (value: string) => void
}

// Additive field di section "Data Dasar" — organizer paste link share Google
// Maps ATAU alamat/koordinat teks bebas, tanpa API key/billing (lihat
// lib/mapsEmbed.ts). Preview mini di sini murni konfirmasi cepat buat
// organizer; peta "asli" tetap dirender lewat EventLocationMap yang sama
// dipakai halaman detail volunteer.
export default function MapsLinkField({ value, onChange }: MapsLinkFieldProps) {
  const preview = value.trim() ? resolveMapsEmbed(value) : null

  return (
    <div className="create-event__field">
      <label htmlFor="mapLink">Link Google Maps / Alamat Lengkap Lokasi (opsional)</label>
      <input
        id="mapLink"
        placeholder="Tempel link share Google Maps, atau tulis alamat lengkap/koordinat"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="maps-link-field__helper">
        Tempel link share Google Maps, atau tulis alamat lengkap/koordinat kegiatan — ini akan ditampilkan sebagai peta
        interaktif di halaman event.
      </p>
      {preview && (
        <div className="maps-link-field__preview">
          {preview.embedSrc ? (
            <iframe src={preview.embedSrc} loading="lazy" title="Preview peta lokasi" />
          ) : preview.externalUrl ? (
            <a href={preview.externalUrl} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">
              Buka di Google Maps
            </a>
          ) : null}
        </div>
      )}
    </div>
  )
}
