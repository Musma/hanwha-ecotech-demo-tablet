const TABLET_WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

export function formatTabletTime(date: Date) {
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

export function formatTabletDate(date: Date) {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const weekday = TABLET_WEEKDAY_LABELS[date.getDay()]

  return `${year}. ${month}. ${day}. (${weekday})`
}

export function getMillisecondsUntilNextMinute(date: Date) {
  return 60_000 - (date.getSeconds() * 1000 + date.getMilliseconds())
}
