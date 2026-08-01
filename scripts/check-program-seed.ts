import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Confere os JSONs do seed sem tocar no banco: o seed aborta o build de
// produção com um throw quando encontra slug fora do catálogo, e aqui o mesmo
// erro aparece em milissegundos.

interface SeedExercise {
  slug: string
  targetSets: number
  targetReps: number
  targetRepsMax: number | null
}

interface SeedTemplate {
  name: string
  exercises: SeedExercise[]
}

interface SeedLevel {
  level: number
  name: string
  unlockThreshold: number
  templates: SeedTemplate[]
}

interface SeedProgram {
  slug: string
  name: string
  audience: string
  levels: SeedLevel[]
}

const dir = join(__dirname, '..', 'prisma', 'seed-data')

function read<T>(file: string): T {
  return JSON.parse(readFileSync(join(dir, file), 'utf-8')) as T
}

/* eslint-disable no-console */
const catalog = new Set(
  read<{ slug: string }[]>('exercises.json').map((item) => item.slug),
)
const programs = [
  read<SeedProgram>('fifty-repz-program.json'),
  read<SeedProgram>('fifty-repz-feminino-program.json'),
]

const problems: string[] = []
const fail = (message: string) => problems.push(message)

programs.forEach((program) => {
  const where = (template: SeedTemplate) => `${program.slug} / ${template.name}`

  if (!['MALE', 'FEMALE'].includes(program.audience)) {
    fail(`${program.slug}: audience inválida (${program.audience})`)
  }

  program.levels.forEach((level, index) => {
    if (level.level !== index + 1) {
      fail(`${program.slug}: níveis fora de sequência em ${level.name}`)
    }
    if (level.unlockThreshold < 1) {
      fail(`${program.slug} / ${level.name}: unlockThreshold inválido`)
    }

    level.templates.forEach((template) => {
      if (template.exercises.length === 0) {
        fail(`${where(template)}: treino sem exercício não pode ser iniciado`)
      }

      const seen = new Set<string>()
      template.exercises.forEach((item) => {
        if (!catalog.has(item.slug)) {
          fail(`${where(template)}: slug fora do catálogo (${item.slug})`)
        }
        if (seen.has(item.slug)) {
          fail(`${where(template)}: exercício repetido (${item.slug})`)
        }
        seen.add(item.slug)

        if (item.targetSets < 1 || item.targetReps < 1) {
          fail(`${where(template)} / ${item.slug}: séries ou repetições < 1`)
        }
        if (
          item.targetRepsMax !== null &&
          item.targetRepsMax <= item.targetReps
        ) {
          fail(
            `${where(template)} / ${item.slug}: faixa de repetições inválida`,
          )
        }
      })
    })
  })
})

const slugs = new Set(programs.map((program) => program.slug))
if (slugs.size !== programs.length) fail('há planos com o mesmo slug')

const audiences = new Set(programs.map((program) => program.audience))
if (audiences.size !== programs.length) fail('há planos com a mesma audiência')

// as duas versões precisam oferecer a mesma jornada: mesma quantidade de
// treinos em cada nível
const shape = (program: SeedProgram) =>
  program.levels.map((level) => level.templates.length).join(',')

if (new Set(programs.map(shape)).size !== 1) {
  fail(`treinos por nível diferem: ${programs.map(shape).join(' vs ')}`)
}

programs.forEach((program) => {
  console.log(`\n${program.slug} (${program.audience})`)
  program.levels.forEach((level) => {
    const sets = level.templates.map((template) =>
      template.exercises.reduce((total, item) => total + item.targetSets, 0),
    )
    console.log(
      `  N${level.level}: ${level.templates.length} treinos · séries ${sets.join('/')}`,
    )
  })
})

if (problems.length > 0) {
  problems.forEach((problem) => console.log(`\nFALHA ${problem}`))
  process.exit(1)
}

console.log('\nok: nenhum problema nos planos do seed')
