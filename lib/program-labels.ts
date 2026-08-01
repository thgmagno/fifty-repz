import type { ProgramAudience } from '@/lib/generated/prisma/enums'

// Rótulo da versão do plano oficial. Record exaustivo, como em
// lib/exercise-labels.ts: valor novo no enum quebra o TypeScript aqui.
export const programAudienceLabels: Record<ProgramAudience, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
}
