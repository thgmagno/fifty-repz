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

interface ProgramLevelCardProps {
  level: ProgramWithProgress['levels'][number]
  // conclusões necessárias no nível anterior para desbloquear este; null
  // para o primeiro nível, que já vem sempre desbloqueado
  unlockRequirement: number | null
}

export function ProgramLevelCard({
  level,
  unlockRequirement,
}: ProgramLevelCardProps) {
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
              {level.completions}/{level.unlockThreshold}
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
            Complete o nível anterior {unlockRequirement} vezes para
            desbloquear.
          </p>
        ) : (
          level.templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm"
            >
              <div>
                <p className="font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground">
                  {template.exercises.length}{' '}
                  {template.exercises.length === 1 ? 'exercício' : 'exercícios'}
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
          ))
        )}
      </CardContent>
    </Card>
  )
}
