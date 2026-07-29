# Fifty Repz — Documento do Projeto

> App social para praticantes de academia — Next.js (PWA)
> Última atualização: 29/07/2026

## Visão Geral

Aplicação Next.js (PWA) com conotação social: usuários podem seguir outras pessoas e visualizar seus treinos e atividades. O crescimento do produto depende da descoberta social (buscar amigos pelo nome do app), e a retenção é reforçada por uma mecânica de progressão embutida no próprio nome.

## Nome

**Fifty Repz**

Histórico da decisão:
- Candidatos iniciais no estilo da concorrência (Hevy, Strong, Strava): Repzy, Setly, Liftly, Volt, Grynd, Spotter, entre outros.
- "Repz" foi a primeira escolha, mas descartada: a busca na Play Store revelou pelo menos 3 apps fitness homônimos (incl. "Repz: HYROX Training Plan", 1 mil+ downloads), prejudicando descoberta e com risco de marca.
- "Fifty Repz" verificado na Play Store: **sem conflitos na categoria fitness** (resultados "Fifty" existentes são de educação, compras e finanças).
- Pendência: registrar domínio (fiftyrepz.app / fiftyrepz.com).

O nome carrega a mecânica do produto (ver seção "Mecânica Fifty Repz"), o que é um ativo de branding.

## Modelo de Cadastro de Exercícios

Opções avaliadas:

| Opção | Prós | Contras |
|---|---|---|
| 1. Cadastro por administrador | Simplicidade; cadastro completo com imagens/vídeos padronizados | Requer manutenção do admin |
| 2. Cadastro livre por usuário | Flexibilidade; pouca manutenção | Complexidade; sem padronização; inviabiliza comparações sociais |
| **3. Híbrido (escolhida)** | Catálogo padronizado + liberdade do usuário | — |

**Decisão: modelo híbrido**
- Seed inicial com ~200-300 exercícios padronizados (nome, grupo muscular, equipamento, imagem/GIF) — base sugerida: free-exercise-db (GitHub, imagens em domínio público). Manutenção próxima de zero.
- Usuário pode criar exercícios próprios quando não encontrar no catálogo (marcados como `custom`, visíveis só para ele ou para seguidores quando aparecem num treino).
- Exercícios do catálogo têm ID único e estável (slug ou UUID fixo) → viabiliza comparações de volume, PRs e rankings entre usuários no futuro.

## Mecânica "Fifty Repz" (progressão)

**Calibragem do "50" — DEFINIDA: 50 execuções do treino.** Completar o template 50 vezes (~2-3 meses a 2x/semana) desbloqueia a recomendação do próximo treino, mais pesado. Vira jornada/conquista e conversa diretamente com o nome.

**Onboarding e modos de uso:** após criar a conta, o usuário escolhe entre:
- **Seguir sozinho** — monta seus próprios treinos livremente a partir do catálogo.
- **Plano Fifty Repz** — sequência oficial de treinos organizada em ordem crescente de dificuldade: treino 1 com exercícios básicos → treino 2 com progressão de carga e repetições → treino 3 → e assim por diante. A mecânica das 50 execuções controla o avanço de um treino para o próximo.

## Stack Técnica

- **Frontend/Backend:** Next.js (App Router)
- **Banco:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth (Google somente)
- **PWA:** next-pwa (service worker, instalável)
- **Offline-first:** registro de séries em IndexedDB com sync posterior — planejar desde o início (academia costuma ter sinal ruim; difícil de encaixar depois)

## Modelo de Dados (esboço)

- `users`
- `follows` (follower_id, following_id)
- `exercises` (id, name, muscle_group, equipment, media_url, is_custom, owner_id nullable)
- `workout_templates` + `workout_template_exercises` (treino montado)
- `workout_sessions` + `session_sets` (execução: peso, reps, RPE)
- `feed` gerado a partir de `workout_sessions` finalizadas, com likes/comentários
- Progressão Fifty Repz: relação usuário × template com contador de execuções (0-50); ao atingir 50, libera o próximo treino do plano
- Plano Fifty Repz: templates do seed com campo de ordem (`plan_order`) definindo a sequência crescente de dificuldade
- **Heatmap de frequência (funcionalidade desejável):** grade estilo contribuições do GitHub no perfil, abaixo da foto/nome — dia preenchido = treinou, vazio = não treinou. Computável a partir das datas de `workout_sessions` finalizadas (sem necessidade de tabela extra)

**Princípio-chave:** separar *template* (treino planejado) de *session* (execução) desde o schema inicial — essencial para o feed social.

## MVP em Fases

### Fase 1 — Core de treino
- Auth (Google)
- Seed do catálogo de exercícios + CRUD de exercícios custom
- Montagem de treinos (templates): nome, exercícios, séries/reps alvo
- Execução de treino: registrar séries (peso, reps), timer de descanso, finalizar sessão
- Histórico pessoal de sessões

### Fase 2 — Social
- Perfil público (foto, bio, estatísticas básicas)
- Seguir / deixar de seguir
- Feed com sessões finalizadas dos seguidos (treino, duração, volume total)
- Likes e comentários

### Fase 3 — PWA e polish
- next-pwa: instalável, service worker, cache de assets e do catálogo
- Offline: treino salvo em IndexedDB, sync ao voltar conexão
- Gráficos de progressão (volume por grupo muscular, PRs)

### Fora do MVP (backlog)
- Rankings/comparações entre usuários
- Vídeos próprios de exercícios
- Planos de treino compartilháveis
- Notificações push
- Gamificação além da mecânica Fifty Repz

## Decisões Pendentes

1. Registro do domínio (fiftyrepz.app / fiftyrepz.com)

## Decisões Fechadas (histórico)

- Mecânica do "50": 50 execuções do treino
- Onboarding: "Seguir sozinho" vs plano Fifty Repz sequencial
- Banco: PostgreSQL no Neon
- ORM: Prisma
- Auth: NextAuth com Google somente
- Funcionalidade desejável registrada: heatmap de frequência de treino no perfil (estilo GitHub)