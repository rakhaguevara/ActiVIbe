import { buildEventCalendarMonths } from '../utils/calendarGrid'
import './EventScheduleCalendar.css'

interface EventScheduleCalendarProps {
  startDate: string
  endDate: string
}

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function EventScheduleCalendar({ startDate, endDate }: EventScheduleCalendarProps) {
  const months = buildEventCalendarMonths(startDate, endDate)

  return (
    <div className="event-schedule-calendar">
      <h3>Jadwal Kegiatan</h3>
      <div className="event-schedule-calendar__months">
        {months.map((month) => (
          <div key={`${month.year}-${month.month}`} className="event-schedule-calendar__month">
            <p className="event-schedule-calendar__month-label">{month.monthLabel}</p>
            <div className="event-schedule-calendar__weekdays">
              {WEEKDAY_LABELS.map((label, index) => (
                <span key={`${label}-${index}`}>{label}</span>
              ))}
            </div>
            {month.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="event-schedule-calendar__week">
                {week.map((day, dayIndex) => (
                  <span
                    key={day.isoDate ?? `empty-${dayIndex}`}
                    className={`event-schedule-calendar__day${day.isHighlighted ? ' event-schedule-calendar__day--highlighted' : ''}`}
                  >
                    {day.day ?? ''}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
