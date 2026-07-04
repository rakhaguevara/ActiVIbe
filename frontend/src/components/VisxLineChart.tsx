import React from 'react'
import {
  XYChart,
  Axis,
  Grid,
  LineSeries,
  Tooltip,
  AreaSeries,
  buildChartTheme
} from '@visx/xychart'
import { ParentSize } from '@visx/responsive'
import { PatternLines } from '@visx/pattern'
import { curveMonotoneX } from '@visx/curve'

export type DataPoint = {
  x: string
  y: number
}

export type SeriesData = {
  label: string
  color: string // Base color for line and pattern
  data: DataPoint[]
}

interface VisxLineChartProps {
  title?: string
  series: SeriesData[]
  height?: number
}

const accessors = {
  xAccessor: (d: DataPoint) => d.x,
  yAccessor: (d: DataPoint) => d.y,
}

export default function VisxLineChart({ title, series }: VisxLineChartProps) {
  // Create a custom theme to override background
  const customTheme = buildChartTheme({
    backgroundColor: '#ffffff', // bg tetap putih
    colors: series.map(s => s.color),
    gridColor: '#f0f0f0',
    gridColorDark: '#e0e0e0',
    svgLabelSmall: { fill: '#737373', fontSize: 11 },
    svgLabelBig: { fill: '#737373', fontSize: 11 },
    tickLength: 4,
  })

  return (
    <div style={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: '8px', zIndex: 50, position: 'relative' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text-heading)' }}>{title}</h3>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            {series.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color }} />
                <span style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ flex: 1, position: 'relative', minWidth: 0, minHeight: 0, zIndex: 50 }}>
        <ParentSize>
          {({ width, height }) => (
            <XYChart
              theme={customTheme}
              xScale={{ type: 'band', paddingInner: 0, paddingOuter: 0 }}
              yScale={{ type: 'linear' }}
              width={width}
              height={height}
              margin={{ top: 8, right: 8, bottom: 24, left: 32 }}
            >
              {/* Define diagonal patterns for the area backgrounds */}
          {series.map((s, i) => (
            <PatternLines
              key={`pattern-${s.label}`}
              id={`pattern-${i}`}
              height={6}
              width={6}
              stroke={s.color}
              strokeWidth={1}
              orientation={['diagonal']}
              background="transparent"
            />
          ))}

          <Grid
            rows={true}
            columns={false}
            numTicks={5}
            strokeDasharray="4,4"
          />

          {series.map((s, i) => (
            <React.Fragment key={`series-${s.label}`}>
              {/* Area filled with pattern */}
              <AreaSeries
                dataKey={`${s.label}-area`}
                data={s.data}
                {...accessors}
                fill={`url(#pattern-${i})`}
                fillOpacity={0.6}
                curve={curveMonotoneX}
              />
              {/* Solid Line on top */}
              <LineSeries
                dataKey={s.label}
                data={s.data}
                {...accessors}
                stroke={s.color}
                strokeWidth={2}
                curve={curveMonotoneX}
              />
            </React.Fragment>
          ))}

          <Axis orientation="bottom" numTicks={series[0]?.data.length} />
          <Axis 
            orientation="left" 
            numTicks={5} 
            hideAxisLine 
            hideTicks 
          />
          
            <Tooltip<DataPoint>
            showVerticalCrosshair
            showSeriesGlyphs
            renderTooltip={({ tooltipData, colorScale }) => {
              if (!tooltipData?.nearestDatum) return null;
              return (
                <div style={{ padding: '8px', fontSize: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, position: 'relative' }}>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                    {accessors.xAccessor(tooltipData.nearestDatum.datum as DataPoint)}
                  </div>
                  {Object.keys(tooltipData.datumByKey).map(key => {
                    const datum = tooltipData.datumByKey[key].datum as DataPoint
                    // filter out the area series from tooltip
                    if (key.includes('-area')) return null;
                    
                    return (
                      <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colorScale?.(key) || series.find(s=>s.label===key)?.color }} />
                        <span>{key}: <strong>{accessors.yAccessor(datum)}</strong></span>
                      </div>
                    )
                  })}
                </div>
              );
            }}
            />
          </XYChart>
        )}
        </ParentSize>
      </div>
    </div>
  )
}
