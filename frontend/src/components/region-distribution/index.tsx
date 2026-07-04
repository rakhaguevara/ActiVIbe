import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Expand, AlertCircle, Loader2 } from 'lucide-react'
import { useRegionDistribution } from '../../hooks/useRegionDistribution'
import IndonesiaMap from './IndonesiaMap'
import StatisticsChart from './StatisticsChart'
import ExpandDialog from './ExpandDialog'
import MapToolbar from './MapToolbar'
import type { GenericMapRef } from './GenericMap'
import type { RegionStat } from '../../types/region'

export default function RegionDistribution() {
  const navigate = useNavigate()
  const { regions, isLoading, isError, refetch } = useRegionDistribution()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const mapRef = useRef<GenericMapRef>(null)

  const [currentPage, setCurrentPage] = useState(0)

  const handleRegionClick = (regionName: string) => {
    navigate(`/admin/map/${encodeURIComponent(regionName.toLowerCase().replace(/\s+/g, '-'))}`)
  }

  const handleDownload = () => {
    const instance = mapRef.current?.getEchartsInstance()
    if (instance) {
      const url = instance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })
      const link = document.createElement('a')
      link.download = 'region-distribution.png'
      link.href = url
      link.click()
    }
  }

  const handleReset = () => {
    setSearchQuery('')
    const instance = mapRef.current?.getEchartsInstance()
    if (instance) {
      instance.dispatchAction({
        type: 'restore'
      })
    }
  }

  const displayRegions = useMemo(() => {
    return regions.filter((r: RegionStat) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [regions, searchQuery])

  if (isLoading) {
    return (
      <div className="admin-overview__card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ccc' }} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="admin-overview__card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <AlertCircle className="w-8 h-8" style={{ color: 'red' }} />
        <span style={{ marginTop: '8px' }}>Failed to load map data</span>
        <button onClick={() => refetch()} style={{ marginTop: '8px', padding: '8px 16px', background: 'red', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Retry</button>
      </div>
    )
  }

  const ArrowButton = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
    <button 
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [direction]: '8px',
        zIndex: 10,
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid var(--color-border-light)',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        color: 'var(--color-text-heading)'
      }}
    >
      {direction === 'left' ? '◀' : '▶'}
    </button>
  )

  return (
    <div className="admin-overview__card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
      
      {/* HEADER */}
      <div className="admin-overview__card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
        <h3 className="admin-overview__card-title">Region Distribution</h3>
        <button
          onClick={() => setIsExpanded(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          title="Expand Map"
        >
          <Expand size={18} />
        </button>
      </div>

      {/* CONTENT WITH SLIDER */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '260px' }}>
        
        {currentPage === 0 && (
          <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <IndonesiaMap 
              data={displayRegions} 
              onRegionClick={handleRegionClick}
              roam={false} 
            />
          </div>
        )}

        {currentPage === 1 && (
          <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <StatisticsChart data={displayRegions} />
          </div>
        )}

        {/* Navigation Arrows */}
        {currentPage === 1 && <ArrowButton direction="left" onClick={() => setCurrentPage(0)} />}
        {currentPage === 0 && <ArrowButton direction="right" onClick={() => setCurrentPage(1)} />}

        {/* Slide Indicators */}
        <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
          <button 
            onClick={() => setCurrentPage(0)}
            style={{ width: '8px', height: '8px', borderRadius: '50%', padding: 0, border: 'none', background: currentPage === 0 ? 'var(--color-primary)' : '#cbd5e1', cursor: 'pointer' }}
          />
          <button 
            onClick={() => setCurrentPage(1)}
            style={{ width: '8px', height: '8px', borderRadius: '50%', padding: 0, border: 'none', background: currentPage === 1 ? 'var(--color-primary)' : '#cbd5e1', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Fullscreen Expand Dialog */}
      <ExpandDialog
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title="Interactive Region Distribution"
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
          <MapToolbar 
            onSearch={setSearchQuery}
            onFilterProvince={() => {}}
            onFilterNGO={() => {}}
            onFilterEvent={() => {}}
            onReset={handleReset}
            onDownload={handleDownload}
          />
          <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
            <IndonesiaMap 
              ref={mapRef}
              data={displayRegions} 
              onRegionClick={handleRegionClick}
              roam={true} 
            />
          </div>
        </div>
      </ExpandDialog>
    </div>
  )
}
