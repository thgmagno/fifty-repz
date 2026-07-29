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
