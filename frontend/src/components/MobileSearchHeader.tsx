import { FiSearch, FiSliders } from 'react-icons/fi'
import './MobileSearchHeader.css'

interface MobileSearchHeaderProps {
  onClick?: () => void
  title?: string
  subtitle?: string
}

export default function MobileSearchHeader({ 
  onClick, 
  title = "Start your search", 
  subtitle = "Anywhere • Any week • Add filters" 
}: MobileSearchHeaderProps) {
  return (
    <div className="mobile-search-header-container">
      <button type="button" className="mobile-search-header" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <FiSearch className="mobile-search-header__icon" />
        <div className="mobile-search-header__text">
          <span className="mobile-search-header__title">{title}</span>
          <span className="mobile-search-header__subtitle">{subtitle}</span>
        </div>
        {onClick && (
          <div className="mobile-search-header__filter-btn">
            <FiSliders />
          </div>
        )}
      </button>
    </div>
  )
}
