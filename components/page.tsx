import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

// O landmark <main> do documento já vem do layout privado
// (app/(private-route)/layout.tsx); Page é só o container de conteúdo.
export function Page({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section className={cn('flex flex-col gap-6 py-4', className)} {...props} />
  )
}
