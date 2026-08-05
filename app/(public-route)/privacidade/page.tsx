import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/legal-page'

export const metadata: Metadata = {
  title: 'Privacidade',
}

const REPO_URL = 'https://github.com/thgmagno/fifty-repz'

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de privacidade" updatedAt="01/08/2026">
      <p>
        Fifty Repz é um projeto pessoal, feito para portfólio e aberto no GitHub
        — não é uma empresa nem tem fins comerciais. Esta página explica, de
        forma direta, o que é feito com seus dados.
      </p>

      <h2>O que é coletado</h2>
      <p>
        O login é feito exclusivamente com sua conta Google. No primeiro acesso,
        criamos uma conta usando as informações que o Google compartilha com o
        app:
      </p>
      <ul>
        <li>seu nome e foto de perfil (exibidos no app);</li>
        <li>seu e-mail (usado só para identificar sua conta);</li>
        <li>
          um identificador único da sua conta Google (usado internamente para
          reconhecer você em logins futuros).
        </li>
      </ul>
      <p>
        Além disso, ficam guardados os dados que você mesmo cadastra no app:
        nome de usuário, bio, exercícios, treinos, sessões registradas,
        comentários, curtidas e a versão do plano oficial que você escolheu
        seguir.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos um único cookie de sessão, para manter você logado. Ele não é
        usado para rastreamento nem compartilhado com terceiros, e expira
        automaticamente em 7 dias.
      </p>

      <h2>Com quem seus dados são compartilhados</h2>
      <p>
        Com ninguém. Não há analytics de terceiros, publicidade ou venda de
        dados. Nome, foto e bio ficam visíveis para outros usuários do app (é
        uma rede social de treinos); e-mail e identificador do Google nunca são
        exibidos publicamente.
      </p>

      <h2>Exclusão de conta e dados</h2>
      <p>
        Você pode excluir sua conta quando quiser, sem precisar pedir para
        ninguém: entre em <strong>Editar perfil</strong> e use a opção{' '}
        <strong>Excluir minha conta</strong>, no fim da página. Pedimos que você
        digite seu nome de usuário para confirmar, porque a exclusão é imediata
        e definitiva.
      </p>
      <p>
        A exclusão remove, de uma vez, sua conta e tudo que está ligado a ela:
        nome, foto, e-mail, identificador do Google, bio, exercícios que você
        criou, planos e treinos montados, sessões registradas com todas as
        séries e cargas, quem você segue e quem segue você, além das curtidas e
        comentários que você deixou — inclusive nos treinos de outras pessoas.
        Não guardamos cópia nem versão arquivada: não há como recuperar depois.
      </p>
      <p>
        Se preferir, ou se tiver qualquer dúvida sobre seus dados, você também
        pode falar comigo pelo{' '}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          repositório no GitHub
        </a>{' '}
        abrindo uma issue.
      </p>

      <h2>Código aberto</h2>
      <p>
        Todo o código-fonte é público. Se quiser conferir exatamente como os
        dados são tratados, o repositório está linkado acima.
      </p>
    </LegalPage>
  )
}
