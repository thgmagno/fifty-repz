import { ChevronRightIcon, PlayIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplatePreviewDialog } from '@/components/workouts/template-preview-dialog'
import { startWorkoutSession } from '@/lib/actions/workout-sessions'
import type { ProgramTemplate } from '@/lib/workout-programs'

// Linha de um treino do plano oficial, usada na lista de níveis e na de
// treinos. Tocar no nome abre a prévia; "Iniciar" segue à mão para quem já
// sabe o que vai fazer.
export function ProgramTemplateRow({
  template,
}: {
  template: ProgramTemplate
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm">
      <TemplatePreviewDialog
        template={template}
        trigger={
          <button
            type="button"
            aria-label={`Ver exercícios de ${template.name}`}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {template.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {template.exercises.length}{' '}
                {template.exercises.length === 1 ? 'exercício' : 'exercícios'} ·
                Ver detalhes
              </span>
            </span>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <form action={startWorkoutSession}>
        <input type="hidden" name="templateId" value={template.id} />
        <Button type="submit" size="sm">
          <PlayIcon />
          Iniciar
        </Button>
      </form>
    </div>
  )
}
