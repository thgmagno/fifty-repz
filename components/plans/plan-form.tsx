'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { WorkoutPlanFormState } from '@/lib/actions/workout-plans'

interface PlanFormProps {
  action: (
    prevState: WorkoutPlanFormState,
    formData: FormData,
  ) => Promise<WorkoutPlanFormState>
  plan?: { id: string; name: string; description: string | null }
  // "treino": depois de criar o plano, o fluxo segue para montar o treino
  next?: 'treino'
  submitLabel: string
}

const initialState: WorkoutPlanFormState = {}

export function PlanForm({ action, plan, next, submitLabel }: PlanFormProps) {
  const [name, setName] = React.useState(plan?.name ?? '')
  const [description, setDescription] = React.useState(plan?.description ?? '')
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {plan && <input type="hidden" name="id" value={plan.id} />}
      {next && <input type="hidden" name="next" value={next} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="plan-name">Nome do plano</Label>
        <Input
          id="plan-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Meu ABC de academia"
          maxLength={80}
        />
        {state.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="plan-description">Descrição (opcional)</Label>
        <Textarea
          id="plan-description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex.: 3 treinos por semana, foco em ganho de força."
          maxLength={280}
          rows={3}
        />
        {state.errors?.description && (
          <p className="text-sm text-destructive">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {state.errors?.form && (
        <p className="text-sm text-destructive">{state.errors.form[0]}</p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Salvando…' : submitLabel}
      </Button>
    </form>
  )
}
