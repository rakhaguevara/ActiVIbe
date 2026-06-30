import { FiCheckCircle } from 'react-icons/fi'
import './EventAmenities.css'

interface EventAmenitiesProps {
  provisions: string[]
}

export default function EventAmenities({ provisions }: EventAmenitiesProps) {
  return (
    <div className="event-amenities">
      <h3>Apa yang Disediakan</h3>
      <div className="event-amenities__grid">
        {provisions.map((item) => (
          <span key={item} className="event-amenities__item">
            <FiCheckCircle className="event-amenities__icon" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
