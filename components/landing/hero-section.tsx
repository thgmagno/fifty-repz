import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

// Foto de capa (Unsplash, ver crédito no rodapé) — auto-hospedada em
// public/hero-gym.jpg. Se o arquivo ainda não existir, cai no gradiente.
const HERO_IMAGE_SRC = '/hero-gym.jpg'

interface HeroSectionProps {
  error?: string
  showPreviewLogin?: boolean
}

export function HeroSection({ error, showPreviewLogin }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden from-neutral-950 via-neutral-900 to-neutral-800">
      <Image
        src={HERO_IMAGE_SRC}
        alt="Sala de musculação com equipamentos de ginástica"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/65" />

      <ThemeToggle className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 hover:text-white" />

      <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Fifty Repz
        </h1>
        <p className="text-white/80">
          Entre com sua conta Google para começar a treinar.
        </p>

        {error === 'oauth' && (
          <p className="text-sm text-red-400">
            Não foi possível entrar com o Google. Tente novamente.
          </p>
        )}

        <a href="/api/auth/google" className={buttonVariants({ size: 'lg' })}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </a>

        {showPreviewLogin && (
          <a
            href="/api/auth/preview"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white',
            )}
          >
            Entrar como usuário de teste (Preview)
          </a>
        )}
      </div>
    </section>
  )
}
