import { buttonVariants } from '@/components/ui/button'

const REPO_URL = 'https://github.com/thgmagno/fifty-repz'
const PROFILE_URL = 'https://github.com/thgmagno'

// lucide-react não inclui logos de marca (removidos por questão de
// trademark) — ícone do GitHub embutido como SVG, igual ao do Google no hero.
function GithubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

export function OpenSourceSection() {
  return (
    <section className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Gratuito e open source
        </h2>
        <p className="text-muted-foreground">
          Fifty Repz é um projeto pessoal, feito para portfólio e aberto no
          GitHub. Sinta-se à vontade para explorar o código, abrir issues ou só
          bisbilhotar como foi construído.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'default' })}
          >
            <GithubMark />
            Ver repositório
          </a>
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'outline' })}
          >
            <GithubMark />
            Perfil no GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
