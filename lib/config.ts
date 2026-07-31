export const publicRoutes = {
  login: '/inicio',
  nextSw: '/sw.js',
  manifest: '/manifest.json',
  offline: '/offline.html',
}

// Páginas legais: acessíveis tanto para quem ainda não tem conta quanto
// para quem já está logado (diferente de publicRoutes.login, que redireciona
// usuários autenticados para o dashboard)
export const legalRoutes = {
  privacy: '/privacidade',
  terms: '/termos',
}

export const privateRoutes = {
  dashboard: '/',
  exercises: '/exercicios',
  workouts: '/treinos',
  programs: '/programas',
  sessions: '/sessoes',
  history: '/historico',
  profile: '/perfil',
  editProfile: '/perfil/editar',
  search: '/buscar',
  feed: '/feed',
}
