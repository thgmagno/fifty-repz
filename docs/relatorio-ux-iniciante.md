# Relatório de UX — simulação de usuário iniciante

> Data: 31/07/2026
> Perfil simulado: pessoa que nunca usou app de treino e não tem vocabulário de
> academia ("volume", "divisão ABC", "3x10-12", "template").
> Ambiente: app rodando localmente (Next.js dev), banco seedado com os 307
> exercícios do catálogo e o programa oficial Fifty Repz (5 níveis).
> Dispositivo simulado: celular (390×844, touch).

## Como o percurso foi feito

1. Abri `/` sem estar logado → redirecionado para `/inicio` (landing).
2. Entrei pelo botão de login (no ambiente local, o botão de preview; em
   produção o botão equivalente é "Entrar com Google").
3. Caí na Home (`/`).
4. Explorei o menu lateral, `/programas`, `/treinos`, `/exercicios`,
   `/historico`, `/feed`.
5. Iniciei o "Treino A — Peito, ombro e tríceps" do Nível 1.
6. Registrei as 15 séries (3 séries × 5 exercícios) e finalizei o treino.
7. Voltei para Home, Histórico e Programas para ver o que mudou.

O fluxo **funciona de ponta a ponta** — não travou em nenhum momento e nada
quebrou. Os problemas abaixo são de compreensão, orientação e de saídas que
faltam, não de erro técnico.

---

## 1. Entrada e primeiros minutos

### 1.1 Não fica claro que o primeiro login já cria a conta

A landing só oferece "Entrar com Google" / "Entre com sua conta Google para
começar a treinar". Quem quer **criar** uma conta procura por "Criar conta",
"Cadastre-se" ou "Começar grátis" e não encontra. Também não há nenhum aviso do
que será feito com os dados nem link para termos/privacidade — o rodapé só tem o
crédito da foto do Unsplash. Para um app que pede login social, é a hora em que
o usuário leigo mais hesita.

### 1.2 Depois de entrar, ninguém diz o que fazer

A tela pós-login é a Home: nome, `@usuario`, 0 seguidores, 0 seguindo,
"Treinos concluídos 0", "Tempo total treinado 0 min", um heatmap todo cinza e
três cartões de gráfico vazios ("Sem treinos concluídos…"). **Não há um único
botão de ação nessa tela.** O único caminho para treinar é abrir o menu
sanduíche no canto superior esquerdo — que não tem rótulo, só um ícone.

O README prevê um onboarding com escolha entre "Seguir sozinho" e "Plano Fifty
Repz". Ele não existe no app: quem cria a conta é jogado direto num painel de
estatísticas zeradas.

### 1.3 O menu não explica a diferença entre Exercícios, Treinos e Programas

O menu tem: Dashboard, Exercícios, Treinos, Programas, Histórico, Feed, Buscar
pessoas. Para um iniciante, "Exercícios", "Treinos" e "Programas" soam como a
mesma coisa. Eu só descobri a diferença abrindo os três. Também não existe item
"Perfil" — a Home ("Dashboard") _é_ o perfil, mas nada diz isso, e "Editar
perfil" (no rodapé do menu) leva para uma terceira página (`/perfil/<username>`)
depois de salvar.

### 1.4 Palavras em inglês / técnicas na interface em português

Espalhadas pelo app: **"Dashboard"** (menu), **"templates"** ("Seus templates de
treino, prontos para iniciar uma sessão"), **"custom"** ("Catálogo padronizado +
seus exercícios custom", badge "Custom"), **"Reps"** (rótulo do campo na sessão),
**"Duração (s)"** (o "(s)" de segundos não é óbvio). Nada disso significa nada
para quem não é da área — nem para quem é de fora de tecnologia.

---

## 2. Programas (o caminho natural do iniciante)

Foi para onde fui primeiro: um plano pronto é exatamente o que um iniciante quer.

### 2.1 "Complete um nível 50 vezes" é ambíguo — e a conta não é a que parece

O texto aparece três vezes ("Complete um nível 50 vezes para liberar o próximo",
"Complete 50 vezes um nível para liberar o próximo", "Complete o nível anterior
50 vezes para desbloquear") e o selo mostra `0/50`.

Eu entendi: "preciso completar o Nível 1 inteiro (A + B + C) 50 vezes" — ou seja,
150 treinos. Na prática o contador soma **qualquer sessão finalizada de qualquer
treino do nível**: fiz o Treino A uma vez e o selo virou `1/50`. São 50 sessões,
não 50 ciclos. Nada na tela esclarece isso, e o selo `0/50` não tem legenda
alguma.

Detalhe relacionado: **qualquer** sessão finalizada conta, mesmo sem nenhuma
série registrada.

### 2.2 Os nomes dos níveis são jargão puro

"Divisão ABC", "Divisão ABCD", "Upper/Lower", "Push/Pull/Legs", "Elite". Um
iniciante não sabe escolher nem entender o que está bloqueado. Pior: a descrição
do **Nível 1** se explica por referência ao **Nível 2** e a um treino que não
existe no programa — "Versão mais simples da divisão ABCD do nível 2 (…) uma
rotina mais variada que o treino de corpo todo". Para entender o nível inicial
eu preciso já saber o que é o nível seguinte.

### 2.3 Não dá para ver o treino antes de começar

Cada treino mostra só o nome e "5 exercícios", e o único botão é **Iniciar**. Não
existe forma de espiar quais exercícios são, quantas séries, o que vou precisar
de equipamento. Como iniciante, eu quero olhar antes — e a única maneira de olhar
é começar o treino (com cronômetro rodando).

### 2.4 Nada diz qual treino fazer hoje nem com que frequência

Treinos A, B e C aparecem lado a lado, todos igualmente disponíveis. Não há
"próximo treino sugerido", nem indicação de que se alternam, nem recomendação de
frequência semanal ou de descanso. Depois de terminar o Treino A, a tela continua
exatamente igual — o A não fica marcado como feito e o B não é sugerido.

---

## 3. Durante o treino

### 3.1 "Iniciar" começa de verdade — e não existe como voltar atrás

Clicar em "Iniciar" cria a sessão na hora e o cronômetro começa a correr. A
partir daí o único botão de saída é **"Finalizar treino"**. Não existe
"Cancelar", "Descartar" ou "Sair sem salvar".

Consequência para quem clicou só para ver: ou finaliza (e grava um treino falso
no histórico, que aparece no feed, conta no total de treinos concluídos e soma
+1 no contador `x/50`), ou abandona — e aí a sessão fica "em andamento" para
sempre, bloqueando o início de qualquer outro treino (ver 3.2).

### 3.2 Com um treino em andamento, os botões "Iniciar" levam para o treino errado

Reproduzi: iniciei o "Treino B", voltei para Programas e cliquei em **Iniciar do
Treino C**. Fui parar dentro do **Treino B**, sem nenhuma mensagem. Existe um
aviso "Treino em andamento" no topo da página, mas os botões continuam ativos e
prometem uma coisa que não acontece. O mesmo vale na tela de Treinos.

### 3.3 "Alvo: 3x10-12" não é lido por um iniciante

É a única indicação do que fazer no exercício. Ninguém explica que significa
"3 séries de 10 a 12 repetições". Também não há um contador visível de séries
antes da primeira ser registrada (o `1/3 séries` só aparece depois).

### 3.4 O campo Peso é limpo a cada série

Registrei "20 kg × 10". No campo seguinte, o peso voltou a ficar vazio (com o
traço "—" de placeholder) e as repetições voltaram para o valor alvo. Como quase
sempre se repete o mesmo peso, tive que digitar 20 de novo, e de novo. Em 5
exercícios × 3 séries isso é digitar o peso 15 vezes, com o celular na mão, no
meio da academia. O esperado é o app repetir o valor da série anterior.

### 3.5 Não há instrução de execução dentro do treino

Durante a sessão, o único apoio é o botão **"Imagens"**, que abre 2 fotos sem
legenda (posição inicial e final, mas nada diz isso). O texto **"Como executar"**,
com o passo a passo numerado, existe — mas só no catálogo de Exercícios, que é
outra tela. É exatamente na hora do treino que o iniciante precisa dele.

### 3.6 Nada orienta qual peso usar

O campo "Peso (kg)" vem vazio, sem explicação de que é opcional nem do que
acontece se ficar em branco (registrei "15 reps" sem peso no abdominal e a série
foi salva assim — e depois sumiu dos gráficos, ver 4.2). Para a primeira sessão
de alguém que nunca treinou, não há nenhuma dica de como escolher a carga.

### 3.7 O cronômetro de descanso some da tela

O timer fica em um cartão no topo da página. Quando registrei a série do
exercício 4 ou 5, a tela já estava rolada bem para baixo e o contador ficou fora
de vista — não dá para saber quanto falta sem rolar para cima. Ele também toca um
bipe no fim, mas a duração escolhida volta para 90 s a cada recarregamento da
página (não é lembrada).

### 3.8 "Finalizar treino" fica só no topo, sem aviso nenhum

Terminei os 5 exercícios (o cabeçalho mostrava `5/5 exercícios`) e nada
aconteceu: nenhum aviso de "treino completo, quer finalizar?". Foi preciso rolar
toda a página de volta até o topo para achar o botão. E, no caminho contrário, se
eu finalizar com exercícios pendentes, a confirmação também não avisa que faltam
exercícios — só diz que a sessão será salva.

### 3.9 "Pular" sem explicar consequência

Ao lado de cada exercício há "Pular", sem indicação do que muda (o exercício
conta como concluído para o contador de exercícios do treino).

---

## 4. Depois de finalizar

### 4.1 O fim do primeiro treino não tem nenhuma recompensa

Finalizado, a tela vira um registro estático: nome do treino, "Concluído em
31/07/2026, 14:35 — 4 min no total", lista de séries, um coração de curtida, uma
caixa de comentário e "Voltar ao histórico". Não há:

- comemoração ou reconhecimento do **primeiro** treino;
- resumo do esforço (volume total, número de séries, comparação);
- aviso de que o contador do programa foi de 0/50 para 1/50;
- sugestão do próximo passo ("próximo: Treino B").

É o momento de maior engajamento do app inteiro e ele passa em branco. (Detalhe
menor: dá para curtir e comentar o próprio treino.)

### 4.2 Os gráficos falam uma língua que o iniciante não fala

Na Home aparecem "Volume total por semana" e "Volume por grupo muscular". A
palavra **"volume"** nunca é explicada em lugar nenhum (é peso × repetições). O
gráfico semanal não tem eixo, valores nem unidade — só uma barra preta e datas.

Além disso, o abdominal que fiz sem peso **não aparece em lugar nenhum**: não
entra no volume (peso 0) nem nos recordes. O grupo "Abdômen" simplesmente não
existe no gráfico, sem nenhuma explicação — parece que o app perdeu meu treino.

### 4.3 O heatmap não tem legenda

"Frequência no último ano" mostra uma grade de bolinhas cinzas com uma verde. Não
há meses, dias da semana, nem legenda de cor. A única informação extra é um
tooltip com a data — que, no celular (touch), praticamente não abre. Sem
contexto, é um enfeite.

---

## 5. Outros pontos observados

### 5.1 A abertura bloqueia o app por ~4 segundos

Toda vez que abro o app numa aba/sessão nova, uma tela preta com um "rolo" de
números de 0 a 50 ocupa a tela inteira por cerca de 4 segundos (3,1 s de
animação + 0,7 s parado + 0,5 s de fade), sem botão para pular e sem
possibilidade de tocar em nada. Medi 3.988 ms até a tela liberar. É bonito na
primeira vez; na academia, com o treino esperando, é tempo parado.

### 5.2 O catálogo carrega 307 exercícios de uma vez

`/exercicios` renderiza **todos** os 307 exercícios do catálogo, cada um com
imagem, sem paginação nem carregamento incremental. Rolar a lista no celular é
lento e, com o sinal ruim típico de academia, é muito dado baixado à toa.

### 5.3 Editar perfil não deixa mudar nome nem foto

A tela "Editar perfil" tem apenas "Nome de usuário" e "Bio". O nome exibido e a
foto vêm do Google e não podem ser alterados — nem há aviso disso.

---

## Resumo priorizado

| Issue | Problema                                                                 | Onde              | Impacto |
| ----- | ------------------------------------------------------------------------ | ----------------- | ------- |
| #64   | Sem onboarding: tela pós-cadastro zerada e sem nenhuma ação              | Home              | Alto    |
| #65   | Não dá para cancelar/descartar uma sessão iniciada por engano            | Sessão            | Alto    |
| #66   | "Iniciar" leva silenciosamente para a sessão em andamento errada         | Programas/Treinos | Alto    |
| #67   | Sem "Como executar" durante o treino (só 2 fotos sem legenda)            | Sessão            | Alto    |
| #68   | Campo de peso limpo a cada série (redigitação constante)                 | Sessão            | Alto    |
| #69   | Fim do treino sem resumo, comemoração ou próximo passo                   | Pós-treino        | Alto    |
| #70   | "Complete um nível 50 vezes" ambíguo e contagem diferente do texto       | Programas         | Alto    |
| #71   | Não é possível ver os exercícios antes de iniciar o treino               | Programas         | Alto    |
| #72   | "Alvo: 3x10-12" e "Reps" sem explicação                                  | Sessão            | Médio   |
| #73   | Nada indica qual treino fazer hoje nem a frequência                      | Programas         | Médio   |
| #74   | Jargão nos nomes dos níveis + descrição circular do Nível 1              | Programas         | Médio   |
| #75   | Timer de descanso sai da tela e não lembra a duração                     | Sessão            | Médio   |
| #76   | "Finalizar treino" só no topo, sem aviso de completo/incompleto          | Sessão            | Médio   |
| #77   | "Volume" nunca explicado; gráficos sem unidade; peso corporal ignorado   | Progresso         | Médio   |
| #78   | Heatmap sem legenda e com tooltip inviável no celular                    | Perfil            | Médio   |
| #79   | Splash bloqueante de ~4 s sem pular                                      | Global            | Médio   |
| #80   | Catálogo com 307 exercícios sem paginação                                | Exercícios        | Médio   |
| #81   | Menu sem "Perfil" e sem distinção clara entre as seções                  | Navegação         | Médio   |
| #82   | Jargão técnico em português ("Dashboard", "templates", "custom", "Reps") | Global            | Baixo   |
| #83   | Login não deixa claro que cria conta; sem termos/privacidade             | Landing           | Baixo   |
| #84   | Nada orienta qual peso usar; campo não indica que é opcional             | Sessão            | Baixo   |
| #85   | "Pular" exercício sem explicar consequência                              | Sessão            | Baixo   |
| #86   | Editar perfil não permite mudar nome exibido nem foto                    | Perfil            | Baixo   |
