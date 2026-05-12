// Time is UTC end-to-end. Never use locale-default formatting.

const utcFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function formatUtc(value: Date | string | number): string {
  const d = value instanceof Date ? value : new Date(value)
  return utcFormatter.format(d)
}

export function isoUtc(value: Date | string | number): string {
  const d = value instanceof Date ? value : new Date(value)
  return d.toISOString()
}
