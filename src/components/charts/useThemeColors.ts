'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * Reads CSS variable values from the document root. Re-reads on every theme
 * change so chart libraries that can't consume CSS vars (Chart.js) get fresh
 * RGB strings on toggle.
 */
const TOKEN_NAMES = [
  '--background',
  '--surface',
  '--elevated',
  '--foreground',
  '--muted-foreground',
  '--faint-foreground',
  '--border',
  '--border-strong',
  '--grid',
  '--positive',
  '--negative',
  '--primary',
  '--warning',
] as const

export type ThemeTokenName = (typeof TOKEN_NAMES)[number]
export type ThemeColors = Record<ThemeTokenName, string>

function read(): ThemeColors {
  if (typeof window === 'undefined') {
    return Object.fromEntries(TOKEN_NAMES.map((n) => [n, ''])) as ThemeColors
  }
  const styles = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    TOKEN_NAMES.map((n) => [n, styles.getPropertyValue(n).trim()]),
  ) as ThemeColors
}

export function useThemeColors(): ThemeColors {
  const { resolvedTheme } = useTheme()
  const [colors, setColors] = useState<ThemeColors>(read)

  useEffect(() => {
    // Reading happens after paint so the new CSS variables are in place.
    const id = requestAnimationFrame(() => setColors(read()))
    return () => cancelAnimationFrame(id)
  }, [resolvedTheme])

  return colors
}
