import { legalRoutes } from '@/lib/config'

const PHOTOGRAPHER_NAME = 'Risen Wang'
const PHOTOGRAPHER_URL =
  'https://unsplash.com/@risennnnn?utm_source=fifty_repz&utm_medium=referral'
const UNSPLASH_URL =
  'https://unsplash.com/?utm_source=fifty_repz&utm_medium=referral'

export function LandingFooter() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t px-4 py-6 text-center text-xs text-muted-foreground">
      <p className="flex flex-wrap justify-center gap-x-3">
        <a
          href={legalRoutes.privacy}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Privacidade
        </a>
        <a
          href={legalRoutes.terms}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Termos de uso
        </a>
      </p>
      <p>
        Foto de{' '}
        <a
          href={PHOTOGRAPHER_URL}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {PHOTOGRAPHER_NAME}
        </a>{' '}
        no{' '}
        <a
          href={UNSPLASH_URL}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Unsplash
        </a>
      </p>
    </footer>
  )
}
