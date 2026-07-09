import { useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { FiX, FiHeart } from 'react-icons/fi'
import { getCategoryStyle } from '../utils/categoryStyle'
import { formatDateShort } from '../utils/formatDate'
import { useBookmarkedEvents } from '../hooks/useBookmarkedEvents'
import { bookmarkEventRequest } from '../lib/eventApi'
import { invalidateRecommendations } from '../services/recommendation.service'
import type { Event } from '../types/event'
import './SwipeDeck.css'

const DECK_SIZE = 10
const SAVE_TARGET = 5
const SWIPE_THRESHOLD = 100

interface SwipeDeckProps {
  events: Event[]
  onComplete: (savedEvents: Event[]) => void
}

type Direction = 'left' | 'right'

export default function SwipeDeck({ events, onComplete }: SwipeDeckProps) {
  // Dibekukan sekali saat mount — kalau dibaca ulang dari prop `events` tiap
  // render, refetch rekomendasi yang dipicu invalidateRecommendations() (mis.
  // setelah swipe-kanan mengubah behavioral boost) bisa mengubah matchScore/
  // urutan di tengah sesi, membuat kartu yang baru di-swipe muncul lagi.
  const [deck] = useState(() => events.slice(0, DECK_SIZE))
  const { isBookmarked } = useBookmarkedEvents()
  const [deckIndex, setDeckIndex] = useState(0)
  const [savedEvents, setSavedEvents] = useState<Event[]>([])
  const [exitDirection, setExitDirection] = useState<Direction | null>(null)

  const handleSwipe = (direction: Direction) => {
    const current = deck[deckIndex]
    if (!current || exitDirection) return
    setExitDirection(direction)

    // Fire-and-forget, TIDAK invalidateRecommendations() di sini — hook
    // useRecommendations() set isLoading: true tiap kali cache di-invalidate
    // (lihat subscribeRecommendations), yang bikin FindActivityPage sempat
    // ganti cabang render ke SectionState loading dan meng-unmount SwipeDeck
    // ini, menghapus progress sesi (deckIndex/savedEvents). Cache di-refresh
    // sekali saja di akhir sesi (lihat sessionDone di bawah), bukan per kartu.
    if (direction === 'right' && !isBookmarked(current.id)) {
      bookmarkEventRequest(current.id).catch(() => {})
    }

    const nextSaved = direction === 'right' ? [...savedEvents, current] : savedEvents
    if (direction === 'right') setSavedEvents(nextSaved)

    const isLastCard = deckIndex + 1 >= deck.length
    const sessionDone = nextSaved.length >= SAVE_TARGET || isLastCard

    window.setTimeout(() => {
      setDeckIndex((i) => i + 1)
      setExitDirection(null)
      if (sessionDone) {
        invalidateRecommendations()
        onComplete(nextSaved)
      }
    }, 220)
  }

  const visibleCards = deck.slice(deckIndex, deckIndex + 3)

  if (visibleCards.length === 0) {
    return null
  }

  return (
    <div className="swipe-deck">
      <div className="swipe-deck__stack">
        <AnimatePresence>
          {visibleCards.map((event, stackPos) => (
            <SwipeCard
              key={event.id}
              event={event}
              stackPos={stackPos}
              isTop={stackPos === 0}
              exitDirection={stackPos === 0 ? exitDirection : null}
              onSwipe={handleSwipe}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="swipe-deck__controls">
        <button
          type="button"
          className="swipe-deck__control swipe-deck__control--skip"
          aria-label="Lewati kegiatan"
          onClick={() => handleSwipe('left')}
        >
          <FiX />
        </button>
        <button
          type="button"
          className="swipe-deck__control swipe-deck__control--save"
          aria-label="Simpan kegiatan"
          onClick={() => handleSwipe('right')}
        >
          <FiHeart />
        </button>
      </div>

      <p className="swipe-deck__progress">
        {Math.min(deckIndex + 1, deck.length)}/{deck.length} · {savedEvents.length} disimpan
      </p>
    </div>
  )
}

interface SwipeCardProps {
  event: Event
  stackPos: number
  isTop: boolean
  exitDirection: Direction | null
  onSwipe: (direction: Direction) => void
}

function SwipeCard({ event, stackPos, isTop, exitDirection, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const saveOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const skipOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])
  const { icon: Icon } = getCategoryStyle(event.category)
  const visibleSkills = event.skills.slice(0, 3)

  const exitX = exitDirection === 'right' ? 600 : exitDirection === 'left' ? -600 : 0

  return (
    <motion.div
      className="swipe-deck__card"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: 10 - stackPos,
      }}
      initial={{ scale: 1 - stackPos * 0.04, y: stackPos * 12, opacity: 1 }}
      animate={{ scale: 1 - stackPos * 0.04, y: stackPos * 12, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.22 } }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onSwipe('right')
        else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe('left')
      }}
    >
      {isTop && (
        <>
          <motion.span className="swipe-deck__stamp swipe-deck__stamp--save" style={{ opacity: saveOpacity }}>
            SIMPAN
          </motion.span>
          <motion.span className="swipe-deck__stamp swipe-deck__stamp--skip" style={{ opacity: skipOpacity }}>
            LEWATI
          </motion.span>
        </>
      )}

      <div className="swipe-deck__image-wrap">
        <img src={event.imageUrl} alt="" className="swipe-deck__image" draggable={false} />
        <span className="swipe-deck__badge">
          {event.symbol ? `${event.symbol} ` : ''}{event.matchScore}%
        </span>
      </div>

      <div className="swipe-deck__content">
        <h3 className="swipe-deck__title">{event.title}</h3>
        <div className="swipe-deck__tags-row">
          <Icon className="swipe-deck__icon" aria-hidden="true" />
          <span className="swipe-deck__meta">{event.category} · {event.location}</span>
        </div>
        <div className="swipe-deck__skills-row">
          {visibleSkills.map((skill) => (
            <span key={skill} className="swipe-deck__skill-chip">{skill}</span>
          ))}
        </div>
        <p className="swipe-deck__desc">{event.description}</p>
        <div className="swipe-deck__footer">
          <span className="swipe-deck__quota">{event.filledSlots}/{event.quota} slot</span>
          <span className="swipe-deck__date">
            {formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
