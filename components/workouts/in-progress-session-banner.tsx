import Link from 'next/link'
import { PlayIcon, Trash2Icon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { DiscardSessionDialog } from '@/components/sessions/discard-session-dialog'
import { privateRoutes } from '@/lib/config'

export function InProgressSessionBanner({
  session,
}: {
  session: { id: string; templateName: string; loggedSets: number }
}) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            Treino em andamento: {session.templateName}
          </p>
          <p className="text-sm text-muted-foreground">
            Você tem uma sessão ativa. Continue de onde parou.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* sem o descarte aqui, a sessão aberta por engano continua
              bloqueando o início de qualquer outro treino */}
          <DiscardSessionDialog
            sessionId={session.id}
            loggedSets={session.loggedSets}
            trigger={
              <Button variant="ghost" className="text-destructive">
                <Trash2Icon />
                Descartar
              </Button>
            }
          />
          <Link
            href={`${privateRoutes.sessions}/${session.id}`}
            className={buttonVariants()}
          >
            <PlayIcon />
            Continuar treino
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
