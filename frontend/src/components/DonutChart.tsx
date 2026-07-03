import './DonutChart.css'

interface DonutChartProps {
  title: string
  value: number
  color: string
  trackColor: string
}

const SIZE = 160
const STROKE = 16
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function DonutChart({ title, value, color, trackColor }: DonutChartProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const filled = (clamped / 100) * CIRCUMFERENCE

  return (
    <div className="donut-chart card">
      <h3 className="donut-chart__title">{title}</h3>

      <div className="donut-chart__plot">
        <svg
          className="donut-chart__svg"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${title}: ${clamped}%`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            style={{ stroke: trackColor }}
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            style={{ stroke: color }}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            className="donut-chart__arc"
          />
        </svg>

        <div className="donut-chart__center">
          <span className="donut-chart__value">{clamped}%</span>
        </div>
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          <tr>
            <th scope="row">Persentase</th>
            <td>{clamped}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
