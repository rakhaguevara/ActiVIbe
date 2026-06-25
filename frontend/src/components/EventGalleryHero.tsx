import { getCategoryStyle } from '../utils/categoryStyle'
import './EventGalleryHero.css'

interface EventGalleryHeroProps {
  category: string
}

export default function EventGalleryHero({ category }: EventGalleryHeroProps) {
  const { icon: Icon, bgToken } = getCategoryStyle(category)

  return (
    <div className="event-gallery-hero" style={{ background: bgToken }}>
      <Icon className="event-gallery-hero__icon" aria-hidden="true" />
      <span className="event-gallery-hero__label">{category}</span>
    </div>
  )
}
