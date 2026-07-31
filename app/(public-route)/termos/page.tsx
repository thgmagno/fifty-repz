import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/legal-page'

export const metadata: Metadata = {
  title: 'Termos de uso',
}

const REPO_URL = 'https://github.com/thgmagno/fifty-repz'

export default function TermosPage() {
  return (
    <LegalPage title="Termos de uso" updatedAt="31/07/2026">
      <p>
        Fifty Repz é um projeto pessoal, gratuito e de código aberto, feito para
        portfólio. Ao usar o app, você concorda com estes termos.
      </p>

      <h2>O serviço</h2>
      <p>
        O app é oferecido &ldquo;como está&rdquo;, sem garantias de
        disponibilidade, continuidade ou ausência de erros. Não há suporte
        formal — é mantido por uma pessoa, nas horas vagas.
      </p>

      <h2>Sua conta</h2>
      <p>
        O login é feito com sua conta Google. Você é responsável por manter o
        acesso a essa conta seguro; qualquer atividade feita através dela é de
        sua responsabilidade.
      </p>

      <h2>Conteúdo que você publica</h2>
      <p>
        Treinos, comentários, bio e outros conteúdos que você cadastra continuam
        sendo seus. Ao publicá-los no app (por exemplo, no feed), você entende
        que ficam visíveis para outras pessoas que usam o Fifty Repz, conforme
        descrito na{' '}
        <a href="/privacidade" className="underline underline-offset-2">
          política de privacidade
        </a>
        .
      </p>

      <h2>Uso adequado</h2>
      <p>
        Não use o app para publicar conteúdo ofensivo, ilegal ou que viole
        direitos de terceiros. Contas usadas de má-fé podem ser suspensas ou
        removidas.
      </p>

      <h2>Sem responsabilidade por dados de treino</h2>
      <p>
        As informações do app (cargas, séries, instruções de exercícios) têm
        caráter apenas informativo e não substituem orientação de um
        profissional de educação física. Treine dentro dos seus limites.
      </p>

      <h2>Mudanças</h2>
      <p>
        Por ser um projeto em desenvolvimento contínuo, estes termos podem
        mudar. Alterações relevantes serão refletidas nesta página.
      </p>

      <h2>Dúvidas</h2>
      <p>
        Perguntas sobre estes termos podem ser abertas como issue no{' '}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          repositório no GitHub
        </a>
        .
      </p>
    </LegalPage>
  )
}
