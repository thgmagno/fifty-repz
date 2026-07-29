import type { Equipment, MuscleGroup } from '@/lib/generated/prisma/enums'

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  ABDOMINALS: 'Abdômen',
  ABDUCTORS: 'Abdutores',
  ADDUCTORS: 'Adutores',
  BICEPS: 'Bíceps',
  CALVES: 'Panturrilhas',
  CHEST: 'Peito',
  FOREARMS: 'Antebraços',
  GLUTES: 'Glúteos',
  HAMSTRINGS: 'Posteriores de coxa',
  LATS: 'Dorsais',
  LOWER_BACK: 'Lombar',
  MIDDLE_BACK: 'Meio das costas',
  NECK: 'Pescoço',
  QUADRICEPS: 'Quadríceps',
  SHOULDERS: 'Ombros',
  TRAPS: 'Trapézio',
  TRICEPS: 'Tríceps',
}

export const equipmentLabels: Record<Equipment, string> = {
  BARBELL: 'Barra',
  DUMBBELL: 'Halteres',
  MACHINE: 'Máquina',
  CABLE: 'Cabo/Polia',
  BODYWEIGHT: 'Peso corporal',
  KETTLEBELL: 'Kettlebell',
  EZ_BAR: 'Barra W',
  BANDS: 'Elástico',
  MEDICINE_BALL: 'Medicine ball',
  EXERCISE_BALL: 'Bola suíça',
  OTHER: 'Outro',
}
