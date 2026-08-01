import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  PrismaClient,
  type Equipment,
  type MuscleGroup,
  type ProgramAudience,
} from '../lib/generated/prisma/client'

interface SeedExercise {
  slug: string
  name: string
  nameEn: string
  muscleGroup: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment
  imageUrls: string[]
  instructions: string[]
}

interface SeedProgramExercise {
  slug: string
  targetSets: number
  targetReps: number
  targetRepsMax: number | null
}

interface SeedProgramTemplate {
  name: string
  exercises: SeedProgramExercise[]
}

interface SeedProgramLevel {
  level: number
  name: string
  description: string
  unlockThreshold: number
  templates: SeedProgramTemplate[]
}

interface SeedProgram {
  slug: string
  name: string
  description: string
  // uma versão do plano oficial por público
  audience: ProgramAudience
  levels: SeedProgramLevel[]
}

// Cada arquivo é uma versão do plano oficial. Mesma marca, mesma estrutura de
// níveis, seleção de exercícios própria.
const PROGRAM_FILES = [
  'fifty-repz-program.json',
  'fifty-repz-feminino-program.json',
]

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function seedProgram(
  program: SeedProgram,
  exerciseIdBySlug: Map<string, string>,
) {
  const programRow = await prisma.workoutProgram.upsert({
    where: { slug: program.slug },
    update: {
      name: program.name,
      description: program.description,
      audience: program.audience,
    },
    create: {
      slug: program.slug,
      name: program.name,
      description: program.description,
      audience: program.audience,
    },
  })

  await Promise.all(
    program.levels.map(async (level) => {
      const levelRow = await prisma.workoutProgramLevel.upsert({
        where: {
          programId_level: { programId: programRow.id, level: level.level },
        },
        update: {
          name: level.name,
          description: level.description,
          unlockThreshold: level.unlockThreshold,
        },
        create: {
          programId: programRow.id,
          level: level.level,
          name: level.name,
          description: level.description,
          unlockThreshold: level.unlockThreshold,
        },
      })

      await Promise.all(
        level.templates.map(async (template, order) => {
          const existing = await prisma.workoutTemplate.findFirst({
            where: { programLevelId: levelRow.id, planOrder: order },
            select: { id: true },
          })

          const items = template.exercises.map((item, position) => {
            const exerciseId = exerciseIdBySlug.get(item.slug)
            if (!exerciseId) {
              throw new Error(
                `Exercício não encontrado no catálogo: ${item.slug}`,
              )
            }
            return {
              exerciseId,
              position,
              targetSets: item.targetSets,
              targetReps: item.targetReps,
              targetRepsMax: item.targetRepsMax,
            }
          })

          if (existing) {
            await prisma.$transaction([
              prisma.workoutTemplateExercise.deleteMany({
                where: { templateId: existing.id },
              }),
              prisma.workoutTemplate.update({
                where: { id: existing.id },
                data: {
                  name: template.name,
                  exercises: { create: items },
                },
              }),
            ])
          } else {
            await prisma.workoutTemplate.create({
              data: {
                name: template.name,
                programLevelId: levelRow.id,
                planOrder: order,
                exercises: { create: items },
              },
            })
          }
        }),
      )
    }),
  )
}

async function main() {
  const exercises: SeedExercise[] = JSON.parse(
    readFileSync(join(__dirname, 'seed-data', 'exercises.json'), 'utf-8'),
  )

  // upsert por slug: o seed é idempotente e pode rodar quantas vezes precisar
  await Promise.all(
    exercises.map((exercise) =>
      prisma.exercise.upsert({
        where: { slug: exercise.slug },
        update: {
          name: exercise.name,
          nameEn: exercise.nameEn,
          muscleGroup: exercise.muscleGroup,
          secondaryMuscles: exercise.secondaryMuscles,
          equipment: exercise.equipment,
          imageUrls: exercise.imageUrls,
          instructions: exercise.instructions,
        },
        create: {
          slug: exercise.slug,
          name: exercise.name,
          nameEn: exercise.nameEn,
          muscleGroup: exercise.muscleGroup,
          secondaryMuscles: exercise.secondaryMuscles,
          equipment: exercise.equipment,
          imageUrls: exercise.imageUrls,
          instructions: exercise.instructions,
          isCustom: false,
        },
      }),
    ),
  )

  // eslint-disable-next-line no-console
  console.log(`Seed concluído: ${exercises.length} exercícios no catálogo.`)

  const exerciseIdBySlug = new Map(
    (
      await prisma.exercise.findMany({
        where: { slug: { in: exercises.map((e) => e.slug) } },
        select: { id: true, slug: true },
      })
    ).map((e) => [e.slug, e.id]),
  )

  // sequencial de propósito: as duas versões dividem o mesmo catálogo e a
  // mesma lógica de upsert, e dobrar a concorrência no passo mais pesado do
  // build não compensa. O encadeamento por reduce é o jeito de esperar uma
  // depois da outra sem laço.
  await PROGRAM_FILES.reduce(async (previous, file) => {
    await previous

    const program: SeedProgram = JSON.parse(
      readFileSync(join(__dirname, 'seed-data', file), 'utf-8'),
    )

    await seedProgram(program, exerciseIdBySlug)

    // eslint-disable-next-line no-console
    console.log(
      `Programa "${program.name}" (${program.audience}) com ${program.levels.length} níveis seedado.`,
    )
  }, Promise.resolve())
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
