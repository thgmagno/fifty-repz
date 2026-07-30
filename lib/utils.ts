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

// 'YYYY-MM-DD' no fuso America/Sao_Paulo — usado para agrupar sessões por
// dia local (heatmap de frequência, etc.), evitando o UTC do servidor.
const localDateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

export function getLocalDateKey(date: Date) {
  return localDateKeyFormatter.format(date)
}

// kg -> "1.240 kg" (volume total de uma sessão: soma de peso × reps)
export function formatVolume(kg: number) {
  return `${Math.round(kg).toLocaleString('pt-BR')} kg`
}

// segunda-feira da semana local (America/Sao_Paulo) como 'YYYY-MM-DD' —
// usado para agrupar volume de treino por semana. Parte do dia local já
// resolvido (getLocalDateKey) e só faz aritmética de calendário a partir
// daí, sem reintroduzir conversão de fuso.
export function getWeekStartKey(date: Date) {
  const [year, month, day] = getLocalDateKey(date).split('-').map(Number)
  const local = new Date(Date.UTC(year, month - 1, day))
  const daysSinceMonday = (local.getUTCDay() + 6) % 7
  local.setUTCDate(local.getUTCDate() - daysSinceMonday)
  return local.toISOString().slice(0, 10)
}

// 'YYYY-MM-DD' -> "28/07" (rótulo curto para eixo de gráfico semanal)
export function formatWeekLabel(weekStartKey: string) {
  const [, month, day] = weekStartKey.split('-')
  return `${day}/${month}`
}
