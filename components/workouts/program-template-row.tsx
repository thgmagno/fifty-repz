import { ChevronRightIcon, PlayIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TemplatePreviewDialog } from '@/components/workouts/template-preview-dialog'
import { startWorkoutSession } from '@/lib/actions/workout-sessions'
import { cn, formatLastDoneLabel } from '@/lib/utils'
import type { ProgramTemplate } from '@/lib/workout-programs'

// Linha de um treino do plano oficial, usada na lista de níveis e na de
// treinos. Tocar no nome abre a prévia; "Iniciar" segue à mão para quem já
// sabe o que vai fazer.
export function ProgramTemplateRow({
  template,
  suggested = false,
}: {
  template: ProgramTemplate
  // treino da vez na rotação do nível: o seguinte ao último concluído
  suggested?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm',
        suggested && 'border-primary',
      )}
    >
      <TemplatePreviewDialog
        template={template}
        trigger={
          // sem aria-label: o rótulo acessível vem do próprio conteúdo, que
          // inclui "Próximo" e a última vez que o treino foi feito
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="min-w-0 truncate font-medium">
                  {template.name}
                </span>
                {suggested && <Badge>Próximo</Badge>}
              </span>
              <span className="block text-xs text-muted-foreground">
                {template.exercises.length}{' '}
                {template.exercises.length === 1 ? 'exercício' : 'exercícios'} ·
                Ver detalhes
              </span>
              <span className="block text-xs text-muted-foreground">
                {template.lastCompletedAt
                  ? `Último: ${formatLastDoneLabel(template.lastCompletedAt)}`
                  : 'Nunca feito'}
              </span>
            </span>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <form action={startWorkoutSession}>
        <input type="hidden" name="templateId" value={template.id} />
        <Button
          type="submit"
          size="sm"
          variant={suggested ? 'default' : 'secondary'}
        >
          <PlayIcon />
          Iniciar
        </Button>
      </form>
    </div>
  )
}
