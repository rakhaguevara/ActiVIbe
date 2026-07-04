import React, { forwardRef } from 'react'
import GenericMap from './GenericMap'
import type { GenericMapRef } from './GenericMap'
import indonesiaGeoJSON from '../../utils/geo/indonesia.geo.json'
import type { RegionStat } from '../../types/region'

interface IndonesiaMapProps {
  data: RegionStat[]
  roam?: boolean
  onRegionClick?: (regionName: string) => void
}

const IndonesiaMap = forwardRef<GenericMapRef, IndonesiaMapProps>(({
  data,
  roam = false,
  onRegionClick
}, ref) => {
  const center: [number, number] = [118.0, -5.5]
  const zoom = 0.95

  return (
    <GenericMap
      ref={ref}
      mapName="indonesia"
      geoJson={indonesiaGeoJSON}
      data={data}
      roam={roam}
      center={center}
      zoom={zoom}
      onRegionClick={onRegionClick}
    />
  )
})

IndonesiaMap.displayName = 'IndonesiaMap'
export default IndonesiaMap
