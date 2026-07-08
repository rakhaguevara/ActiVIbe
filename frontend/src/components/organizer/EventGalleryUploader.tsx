import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { uploadEventGalleryImageRequest } from '../../lib/organizerApi'
import { resolveAssetUrl } from '../../lib/assetUrl'
import type { UploadedFile } from '../../types/organizer'
import './DocumentUploadField.css'
import './EventGalleryUploader.css'

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg']
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

interface EventGalleryUploaderProps {
  images: UploadedFile[]
  onChange: (images: UploadedFile[]) => void
  maxCount?: number
}

// Upload 1-6 foto dokumentasi + reorder drag & drop pakai HTML5 drag events
// native (tidak ada dnd-kit/react-beautiful-dnd di repo ini) — index 0 =
// thumbnail utama, diatur organizer sebelum submit (server cuma menyimpan
// urutan array apa adanya, lihat createEvent()).
export default function EventGalleryUploader({ images, onChange, maxCount = 6 }: EventGalleryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dragIndexRef = useRef<number | null>(null)

  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    setError(null)
    const remainingSlots = maxCount - images.length
    if (remainingSlots <= 0) {
      setError(`Maksimal ${maxCount} gambar.`)
      return
    }
    const toUpload = files.slice(0, remainingSlots)

    setIsUploading(true)
    try {
      const uploaded: UploadedFile[] = []
      for (const file of toUpload) {
        if (!IMAGE_MIME_TYPES.includes(file.type)) {
          setError('Format gambar harus JPG/PNG/JPEG.')
          continue
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          setError('Ukuran gambar maksimal 5MB per gambar.')
          continue
        }
        uploaded.push(await uploadEventGalleryImageRequest(file))
      }
      if (uploaded.length > 0) onChange([...images, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar, coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleDragStart = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    dragIndexRef.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const from = dragIndexRef.current
    dragIndexRef.current = null
    if (from === null || from === index) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(index, 0, moved)
    onChange(next)
  }

  return (
    <div className="event-gallery-uploader">
      {images.length > 0 && (
        <div className="event-gallery-uploader__grid">
          {images.map((image, index) => (
            <div
              key={image.url}
              className="event-gallery-uploader__thumb"
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={handleDrop(index)}
            >
              <img src={resolveAssetUrl(image.url)} alt={image.fileName} />
              {index === 0 && <span className="event-gallery-uploader__badge">Thumbnail Utama</span>}
              <button
                type="button"
                className="event-gallery-uploader__remove"
                aria-label="Hapus gambar"
                onClick={() => removeAt(index)}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxCount && (
        <label className="document-upload-field__upload-label">
          {isUploading ? 'Mengunggah...' : `Tambah Gambar (${images.length}/${maxCount})`}
          <input type="file" accept="image/png,image/jpeg" multiple hidden disabled={isUploading} onChange={handleFilesSelected} />
        </label>
      )}
      {error && <p className="document-upload-field__error">{error}</p>}
    </div>
  )
}
