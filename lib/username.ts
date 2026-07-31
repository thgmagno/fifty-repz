import { prisma } from '@/lib/prisma'

// Rotas e termos que não podem virar /perfil/[username]
const RESERVED_USERNAMES = new Set([
  'admin',
  'perfil',
  'api',
  'login',
  'logout',
  'inicio',
  'boas-vindas',
  'exercicios',
  'treinos',
  'programas',
  'sessoes',
  'historico',
  'settings',
  'progresso',
  'root',
  'usuario',
  'null',
  'undefined',
])

export function slugifyUsername(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}

export function isReservedUsername(username: string) {
  return RESERVED_USERNAMES.has(username)
}

// Gera um username único a partir de um nome/e-mail, adicionando sufixo
// numérico em caso de colisão (com reservados ou com usuários existentes).
export async function generateUniqueUsername(seed: string) {
  const base = slugifyUsername(seed) || 'usuario'
  let suffix = 0
  let candidate = base

  while (isReservedUsername(candidate)) {
    suffix += 1
    candidate = `${base}-${suffix}`
  }

  // eslint-disable-next-line no-await-in-loop
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    suffix += 1
    candidate = `${base}-${suffix}`
  }

  return candidate
}
