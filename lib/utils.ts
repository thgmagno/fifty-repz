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
