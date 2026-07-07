import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiBookmark, FiShare2 } from 'react-icons/fi'
import AccountSidebar from '../../components/AccountSidebar'
import InlineLoading from '../../components/InlineLoading'
import SectionState from '../../components/SectionState'
import MobileSearchHeader from '../../components/MobileSearchHeader'
import { useBookmarkedEvents } from '../../hooks/useBookmarkedEvents'
import { useRecommendations } from '../../hooks/useRecommendations'
import { getCategoryStyle } from '../../utils/categoryStyle'
import { formatDateShort } from '../../utils/formatDate'
import './SavedItemsPage.css'

type Tab = 'kegiatan' | 'organisasi'

export default function SavedItemsPage() {
  const { bookmarkedIds, toggle } = useBookmarkedEvents()
  // Katalog event nyata (recommendations mencakup SEMUA event published,
  // bukan cuma top-N) — dipakai sbg sumber data, disaring ke yg di-bookmark.
  const { events, isLoading, error } = useRecommendations()
  const [tab, setTab] = useState<Tab>('kegiatan')
  const [keyword, setKeyword] = useState('')
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null)

  const savedEvents = useMemo(
    () => events.filter((event) => bookmarkedIds.includes(event.id)),
    [events, bookmarkedIds],
  )

  const filteredEvents = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return savedEvents
    return savedEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q),
    )
  }, [savedEvents, keyword])

  const handleShare = async (eventId: string) => {
    const link = `${window.location.origin}/dashboard?event=${eventId}`
    await navigator.clipboard.writeText(link)
    setCopiedEventId(eventId)
    setTimeout(() => setCopiedEventId((current) => (current === eventId ? null : current)), 1500)
  }

  return (
    <main className="saved-items-page">
      <AccountSidebar active="tersimpan" />

      <div className="saved-items-page__content">
        <div className="saved-items-page__mobile-header">
          <MobileSearchHeader title="Wishlists" subtitle="Cari dan kelola kegiatan tersimpan" />
        </div>
        <header className="saved-items-page__header">
          <h1>Kegiatan Tersimpan</h1>
        </header>

        <div className="saved-items-page__tabs">
          <button
            type="button"
            className={'saved-items-page__tab' + (tab === 'kegiatan' ? ' is-active' : '')}
            onClick={() => setTab('kegiatan')}
          >
            Kegiatan
          </button>
          <span className="saved-items-page__tab is-disabled">
            Organisasi
            <span className="saved-items-page__soon-badge">Segera Hadir</span>
          </span>
        </div>

        <div className="saved-items-page__search">
          <FiSearch className="saved-items-page__search-icon" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari dari kegiatan yang kamu simpan..."
          />
        </div>

        {isLoading ? (
          <InlineLoading />
        ) : error ? (
          <SectionState variant="error" title={error} onRetry={() => window.location.reload()} />
        ) : savedEvents.length === 0 ? (
          <SectionState
            variant="empty"
            title="Kamu belum menyimpan kegiatan apa pun."
            description="Mulai cari kegiatan dan tekan ikon bookmark buat menyimpannya di sini."
            action={{ label: 'Mulai cari kegiatan', to: '/dashboard' }}
          />
        ) : filteredEvents.length === 0 ? (
          <SectionState variant="empty" title="Tidak ada kegiatan tersimpan yang cocok dengan pencarian ini." />
        ) : (
          <div className="saved-items-page__grid">
            {filteredEvents.map((event) => {
              const { icon: Icon } = getCategoryStyle(event.category)
              const visibleSkills = event.skills.slice(0, 2)
              const extraSkillCount = event.skills.length - visibleSkills.length

              return (
                <div key={event.id} className="card saved-items-page__card">
                  <div className="saved-items-page__image-wrap">
                    <img src={event.imageUrl} alt="" className="saved-items-page__image" />
                    <span className="saved-items-page__match-badge">{event.matchScore}%</span>
                  </div>

                  <span className="saved-items-page__title">{event.title}</span>
                  <p className="saved-items-page__org">{event.organizerName} &middot; {event.location}</p>

                  <div className="saved-items-page__tags-row">
                    <Icon className="saved-items-page__icon" aria-hidden="true" />
                    {visibleSkills.map((skill) => (
                      <span key={skill} className="saved-items-page__skill-chip">{skill}</span>
                    ))}
                    {extraSkillCount > 0 && (
                      <span className="saved-items-page__skill-chip">+{extraSkillCount}</span>
                    )}
                  </div>

                  <div className="saved-items-page__footer">
                    <span>{event.filledSlots}/{event.quota} slot</span>
                    <span>{formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}</span>
                  </div>

                  <div className="saved-items-page__actions">
                    <Link
                      to={`/dashboard?event=${event.id}`}
                      className="btn btn--outline btn--sm saved-items-page__detail-btn"
                    >
                      Lihat Detail
                    </Link>
                    <button
                      type="button"
                      className="saved-items-page__icon-button saved-items-page__icon-button--active"
                      aria-label="Hapus dari simpanan"
                      onClick={() => toggle(event.id)}
                    >
                      <FiBookmark fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      className="saved-items-page__icon-button"
                      aria-label="Bagikan kegiatan"
                      onClick={() => handleShare(event.id)}
                    >
                      <FiShare2 />
                    </button>
                    {copiedEventId === event.id && (
                      <span className="saved-items-page__copied-label">Disalin!</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
