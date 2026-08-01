import { LockIcon, PlayIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { startWorkoutSession } from '@/lib/actions/workout-sessions'
import type { ProgramWithProgress } from '@/lib/workout-programs'

interface PlanLevelCardProps {
  level: ProgramWithProgress['levels'][number]
  // conclusões necessárias no nível anterior para desbloquear este; null
  // para o primeiro nível, que já vem sempre desbloqueado
  unlockRequirement: number | null
}

export function PlanLevelCard({
  level,
  unlockRequirement,
}: PlanLevelCardProps) {
  return (
    <Card className={!level.unlocked ? 'opacity-60' : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{level.name}</CardTitle>
          {level.unlocked ? (
            <Badge
              variant={
                level.completions >= level.unlockThreshold
                  ? 'default'
                  : 'outline'
              }
            >
              {level.completions} de {level.unlockThreshold} treinos
            </Badge>
          ) : (
            <Badge variant="secondary">
              <LockIcon />
              Bloqueado
            </Badge>
          )}
        </div>
        {level.description && (
          <CardDescription>{level.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!level.unlocked ? (
          <p className="text-sm text-muted-foreground">
            Conclua {unlockRequirement} treinos do nível anterior para
            desbloquear. Vale qualquer treino dele — não precisa repetir a
            sequência inteira.
          </p>
        ) : (
          <>
            {/* o contador soma sessões concluídas de qualquer treino do
                nível, o que o texto "complete o nível 50 vezes" não deixava
                claro */}
            <div className="flex flex-col gap-0.5 rounded-md border border-dashed p-2.5 text-xs text-muted-foreground">
              <p>
                Treinos concluídos neste nível:{' '}
                <strong className="text-foreground">{level.completions}</strong>{' '}
                de {level.unlockThreshold}
              </p>
              <p>
                Vale qualquer treino do nível — não precisa repetir a sequência
                inteira. Só conta o treino com pelo menos uma série registrada.
              </p>
            </div>
            {level.templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.exercises.length}{' '}
                    {template.exercises.length === 1
                      ? 'exercício'
                      : 'exercícios'}
                  </p>
                </div>
                <form action={startWorkoutSession}>
                  <input type="hidden" name="templateId" value={template.id} />
                  <Button type="submit" size="sm">
                    <PlayIcon />
                    Iniciar
                  </Button>
                </form>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}
