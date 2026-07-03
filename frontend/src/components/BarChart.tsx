import { useState } from 'react'
import './BarChart.css'

export interface BarChartDatum {
  label: string
  value: number
  color: string
  displayValue: string
}

interface BarChartProps {
  title: string
  data: BarChartDatum[]
}

const VIEW_WIDTH = 480
const VIEW_HEIGHT = 220
const TOP_PADDING = 28
const BOTTOM_PADDING = 28
const MAX_BAR_THICKNESS = 24

export default function BarChart({ title, data }: BarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const plotHeight = VIEW_HEIGHT - TOP_PADDING - BOTTOM_PADDING
  const bandWidth = VIEW_WIDTH / data.length
  const barThickness = Math.min(MAX_BAR_THICKNESS, bandWidth * 0.5)

  return (
    <div className="bar-chart card">
      <h3 className="bar-chart__title">{title}</h3>

      <div className="bar-chart__plot">
        <svg
          className="bar-chart__svg"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`${title}: ${data.map((d) => `${d.label} ${d.displayValue}`).join(', ')}`}
        >
          <line
            x1={0}
            y1={VIEW_HEIGHT - BOTTOM_PADDING}
            x2={VIEW_WIDTH}
            y2={VIEW_HEIGHT - BOTTOM_PADDING}
            className="bar-chart__baseline"
          />

          {data.map((d, i) => {
            const barHeight = maxValue > 0 ? (d.value / maxValue) * plotHeight : 0
            const cx = bandWidth * i + bandWidth / 2
            const x = cx - barThickness / 2
            const y = VIEW_HEIGHT - BOTTOM_PADDING - barHeight
            const isActive = activeIndex === i

            return (
              <g
                key={d.label}
                className="bar-chart__bar-group"
                tabIndex={0}
                onPointerEnter={() => setActiveIndex(i)}
                onPointerLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(i)}
                onBlur={() => setActiveIndex(null)}
              >
                {/* transparent hit target, bigger than the visible bar */}
                <rect
                  x={cx - bandWidth / 2}
                  y={TOP_PADDING}
                  width={bandWidth}
                  height={plotHeight}
                  fill="transparent"
                />

                <rect
                  x={x}
                  y={barHeight > 0 ? y : VIEW_HEIGHT - BOTTOM_PADDING - 2}
                  width={barThickness}
                  height={Math.max(barHeight, 2)}
                  rx={4}
                  style={{ fill: d.color }}
                  className={`bar-chart__bar${isActive ? ' bar-chart__bar--active' : ''}`}
                />

                <text x={cx} y={y - 8} textAnchor="middle" className="bar-chart__value">
                  {d.displayValue}
                </text>

                <text x={cx} y={VIEW_HEIGHT - BOTTOM_PADDING + 18} textAnchor="middle" className="bar-chart__label">
                  {d.label}
                </text>

                {isActive && (
                  <foreignObject
                    x={Math.min(Math.max(cx - 60, 0), VIEW_WIDTH - 120)}
                    y={Math.max(y - 46, 0)}
                    width={120}
                    height={34}
                  >
                    <div className="bar-chart__tooltip">
                      <strong>{d.displayValue}</strong>
                      <span>{d.label}</span>
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Kategori</th>
            <th scope="col">Nilai</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.displayValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
