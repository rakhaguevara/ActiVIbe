import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import type { RegionStat } from '../../types/region'

export interface GenericMapRef {
  getEchartsInstance: () => echarts.ECharts | null
}

interface GenericMapProps {
  mapName: string
  geoJson: any // Usually imported JSON object
  data: RegionStat[]
  roam?: boolean
  zoom?: number
  center?: [number, number]
  onRegionClick?: (regionName: string) => void
}

const GenericMap = forwardRef<GenericMapRef, GenericMapProps>(({
  mapName,
  geoJson,
  data,
  roam = false,
  zoom = 1.0,
  center,
  onRegionClick
}, ref) => {
  const chartRef = useRef<ReactECharts>(null)

  // Register the map only once when geoJson changes
  useMemo(() => {
    if (geoJson && mapName) {
      echarts.registerMap(mapName, geoJson)
    }
  }, [geoJson, mapName])

  useImperativeHandle(ref, () => ({
    getEchartsInstance: () => chartRef.current?.getEchartsInstance() || null
  }))

  const options = useMemo(() => {
    // Map our data to ECharts expected format {name: string, value: number, ...otherProps}
    const seriesData = data.map(d => ({
      ...d, // attach full stat object for tooltip first
      name: d.name.toUpperCase(), // Match GeoJSON property (Propinsi is uppercase in our GeoJSON)
      value: d.volunteerCount
    }))

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 8,
        textStyle: { color: '#f8fafc' },
        formatter: (params: any) => {
          if (!params.data || params.data.value === undefined) {
            return `<div class="font-bold border-b border-gray-700 pb-2 mb-2">${params.name}</div>
                    <div class="text-gray-400 text-sm">No Activity</div>`
          }
          const stat: RegionStat = params.data
          return `
            <div class="font-bold text-base border-b border-gray-700 pb-2 mb-2">${stat.name}</div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div class="text-gray-400">Volunteers</div>
              <div class="font-bold text-right text-purple-300">${stat.volunteerCount.toLocaleString()}</div>
              
              <div class="text-gray-400">Events</div>
              <div class="font-bold text-right text-white">${stat.eventCount.toLocaleString()}</div>
              
              <div class="text-gray-400">NGOs</div>
              <div class="font-bold text-right text-white">${stat.ngoCount.toLocaleString()}</div>
              
              <div class="text-gray-400">Hours</div>
              <div class="font-bold text-right text-white">${stat.hours.toLocaleString()}</div>
              
              <div class="text-gray-400">Growth</div>
              <div class="font-bold text-right ${stat.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}">
                ${stat.growth > 0 ? '+' : ''}${stat.growth}%
              </div>
            </div>
          `
        }
      },
      visualMap: {
        type: 'piecewise',
        left: 'center',
        bottom: '12%',
        orient: 'horizontal',
        pieces: [
          { min: 1000, label: '1000+' },
          { min: 501, max: 1000, label: '501-1000' },
          { min: 101, max: 500, label: '101-500' },
          { min: 1, max: 100, label: '1-100' },
          { value: 0, label: '0' }
        ],
        inRange: {
          color: ['#e5e7eb', '#d8b4e2', '#ae71c1', '#854ca6', '#6D50A3', '#4a3275']
        },
        outOfRange: {
          color: '#e5e7eb' // Gray for no data
        },
        textStyle: {
          color: '#64748b',
          fontSize: 12
        },
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 10
      },
      series: [
        {
          name: mapName,
          type: 'map',
          map: mapName,
          roam: roam,
          zoom: zoom,
          center: center,
          nameProperty: 'Propinsi', // Critical: Matches our GeoJSON key
          label: {
            show: false,
            color: '#fff'
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 0.5,
            areaColor: '#e5e7eb' // Default gray
          },
          emphasis: {
            label: { show: false },
            itemStyle: {
              areaColor: '#7C63B8', // Hover Purple
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          select: {
            label: { show: false },
            itemStyle: {
              areaColor: '#6D50A3',
              borderWidth: 1.5,
              borderColor: '#f59e0b'
            }
          },
          data: seriesData
        }
      ]
    }
  }, [data, mapName, roam, zoom, center])

  const onEvents = useMemo(() => ({
    click: (params: any) => {
      if (onRegionClick && params.name) {
        onRegionClick(params.name)
      }
    }
  }), [onRegionClick])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ height: '100%', width: '100%' }}
        onEvents={onEvents}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  )
})

GenericMap.displayName = 'GenericMap'
export default GenericMap
