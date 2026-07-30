import Link from 'next/link'
import { PlayIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { privateRoutes } from '@/lib/config'

export function InProgressSessionBanner({
  session,
}: {
  session: { id: string; templateName: string }
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
        <Link
          href={`${privateRoutes.sessions}/${session.id}`}
          className={buttonVariants()}
        >
          <PlayIcon />
          Continuar treino
        </Link>
      </CardContent>
    </Card>
  )
}
