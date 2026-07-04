

export interface LineSeries {
  label: string
  color: string
  data: number[]
}

interface LineChartProps {
  title?: string
  labels: string[]
  series: LineSeries[]
  height?: number
}

export default function LineChart({ title, labels, series, height = 250 }: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const width = 800 // base viewBox width
  
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  // Find max value
  const allValues = series.flatMap(s => s.data)
  const maxVal = Math.max(...allValues, 10) // at least 10 to avoid div by zero
  
  // Calculate coordinates
  const getX = (index: number) => padding.left + (index * (innerWidth / Math.max(labels.length - 1, 1)))
  const getY = (val: number) => padding.top + innerHeight - (val / maxVal) * innerHeight

  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-border-light)', borderRadius: '12px', padding: '24px' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text-heading)' }}>{title}</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            {series.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ position: 'relative', width: '100%', paddingTop: `${(height / width) * 100}%` }}>
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = padding.top + innerHeight - (ratio * innerHeight)
            return (
              <g key={ratio}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--color-border-light)" strokeDasharray="4 4" />
                <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="var(--color-text-muted)">
                  {Math.round(ratio * maxVal)}
                </text>
              </g>
            )
          })}

          {/* X Axis Labels */}
          {labels.map((label, i) => (
            <text key={i} x={getX(i)} y={height - 5} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">
              {label}
            </text>
          ))}

          {/* Lines and Areas */}
          {series.map((s) => {
            const points = s.data.map((val, i) => `${getX(i)},${getY(val)}`).join(' ')
            const areaPoints = `${getX(0)},${padding.top + innerHeight} ${points} ${getX(s.data.length - 1)},${padding.top + innerHeight}`
            return (
              <g key={s.label}>
                <polygon points={areaPoints} fill={s.color} opacity={0.05} />
                <polyline points={points} fill="none" stroke={s.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {s.data.map((val, i) => (
                  <circle key={i} cx={getX(i)} cy={getY(val)} r="4" fill="#fff" stroke={s.color} strokeWidth="2" />
                ))}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
