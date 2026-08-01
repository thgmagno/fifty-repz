import { LockIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProgramTemplateRow } from '@/components/workouts/program-template-row'
import type { ProgramLevel } from '@/lib/workout-programs'
import type { InProgressSession } from '@/lib/workout-sessions'

interface PlanLevelCardProps {
  level: ProgramLevel
  inProgress: InProgressSession | null
  // conclusões necessárias no nível anterior para desbloquear este; null
  // para o primeiro nível, que já vem sempre desbloqueado
  unlockRequirement: number | null
}

export function PlanLevelCard({
  level,
  inProgress,
  unlockRequirement,
}: PlanLevelCardProps) {
  return (
    <Card className={!level.unlocked ? 'opacity-60' : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{level.name}</CardTitle>
          {level.unlocked ? (
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge
                variant={
                  level.completions >= level.unlockThreshold
                    ? 'default'
                    : 'outline'
                }
              >
                {level.completions}/{level.unlockThreshold}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Treinos concluídos
              </span>
            </div>
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
            desbloquear (qualquer treino conta).
          </p>
        ) : (
          level.templates.map((template) => (
            <ProgramTemplateRow
              key={template.id}
              template={template}
              inProgress={inProgress}
              suggested={template.id === level.suggestedTemplateId}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
