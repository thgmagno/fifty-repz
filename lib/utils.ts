import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// "3x10" ou "3x8-12" quando há faixa de reps
export function formatRepTarget(
  sets: number,
  repsMin: number,
  repsMax?: number | null,
) {
  return repsMax && repsMax !== repsMin
    ? `${sets}x${repsMin}-${repsMax}`
    : `${sets}x${repsMin}`
}

// segundos -> "MM:SS" (ou "H:MM:SS" acima de 1 hora)
export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const pad = (value: number) => value.toString().padStart(2, '0')

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`
}

// segundos -> "45 min" ou "1h 12min" (duração total de uma sessão concluída)
export function formatDurationLong(totalSeconds: number) {
  const totalMinutes = Math.round(Math.max(0, totalSeconds) / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`
}

// Fixo em America/Sao_Paulo: o runtime do servidor (ex.: Vercel) roda em
// UTC, então sem timeZone explícito o horário exibido fica errado.
const sessionDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

export function formatSessionDate(date: Date) {
  return sessionDateFormatter.format(date)
}
