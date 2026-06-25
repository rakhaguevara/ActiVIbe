export interface CalendarDay {
  day: number | null
  isoDate: string | null
  isHighlighted: boolean
}

export interface CalendarMonth {
  year: number
  month: number
  monthLabel: string
  weeks: CalendarDay[][]
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function parseIsoDate(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month: month - 1, day }
}

function toIsoDate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function buildCalendarMonth(
  year: number,
  month: number,
  highlightStartIso: string,
  highlightEndIso: string
): CalendarMonth {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: CalendarDay[] = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null, isoDate: null, isHighlighted: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isoDate = toIsoDate(year, month, day)
    cells.push({
      day,
      isoDate,
      isHighlighted: isoDate >= highlightStartIso && isoDate <= highlightEndIso,
    })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, isoDate: null, isHighlighted: false })
  }

  const weeks: CalendarDay[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return { year, month, monthLabel: `${MONTH_NAMES_ID[month]} ${year}`, weeks }
}

export function buildEventCalendarMonths(startDateIso: string, endDateIso: string): CalendarMonth[] {
  const start = parseIsoDate(startDateIso)
  const end = parseIsoDate(endDateIso)

  const startMonth = buildCalendarMonth(start.year, start.month, startDateIso, endDateIso)

  const sameMonth = start.year === end.year && start.month === end.month
  if (sameMonth) {
    return [startMonth]
  }

  const endMonth = buildCalendarMonth(end.year, end.month, startDateIso, endDateIso)
  return [startMonth, endMonth]
}
