// All numeric formatting funnels through here.
// Never call `.toFixed()` or `.toLocaleString()` directly in components.

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function money(value: number): string {
  return usdFormatter.format(value)
}

export function percent(value: number): string {
  return percentFormatter.format(value)
}

export function decimals(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}
