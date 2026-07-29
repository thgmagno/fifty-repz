import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  PrismaClient,
  type Equipment,
  type MuscleGroup,
} from '../lib/generated/prisma/client'

interface SeedExercise {
  slug: string
  name: string
  nameEn: string
  muscleGroup: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment
  imageUrls: string[]
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

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
        },
        create: {
          slug: exercise.slug,
          name: exercise.name,
          nameEn: exercise.nameEn,
          muscleGroup: exercise.muscleGroup,
          secondaryMuscles: exercise.secondaryMuscles,
          equipment: exercise.equipment,
          imageUrls: exercise.imageUrls,
          isCustom: false,
        },
      }),
    ),
  )

  // eslint-disable-next-line no-console
  console.log(`Seed concluído: ${exercises.length} exercícios no catálogo.`)
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
