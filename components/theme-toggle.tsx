'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const emptySubscribe = () => () => { }

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  // evita mismatch de hidratação: o tema real só é conhecido no cliente
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        disabled
        aria-label="Alternar tema"
        className={className}
      >
        <SunIcon />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={className}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
