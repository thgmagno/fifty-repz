import { permanentRedirect } from 'next/navigation'
import { privateRoutes } from '@/lib/config'

// "Programas" virou "Planos de treino". A rota antiga fica só como redirect,
// para não quebrar link salvo ou página em cache do PWA.
export default function ProgramasPage() {
  permanentRedirect(privateRoutes.plans)
}
