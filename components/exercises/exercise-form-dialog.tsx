'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createExercise,
  updateExercise,
  type ExerciseFormState,
} from '@/lib/actions/exercises'
import { Equipment, MuscleGroup } from '@/lib/generated/prisma/enums'
import { equipmentLabels, muscleGroupLabels } from '@/lib/exercise-labels'

interface ExerciseFormDialogProps {
  trigger: React.ReactElement
  exercise?: {
    id: string
    name: string
    muscleGroup: MuscleGroup
    equipment: Equipment
  }
}

const initialState: ExerciseFormState = {}

export function ExerciseFormDialog({
  trigger,
  exercise,
}: ExerciseFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(exercise?.name ?? '')
  const [muscleGroup, setMuscleGroup] = React.useState<MuscleGroup | null>(
    exercise?.muscleGroup ?? null,
  )
  const [equipment, setEquipment] = React.useState<Equipment | null>(
    exercise?.equipment ?? null,
  )
  const isEditing = Boolean(exercise)
  const action = isEditing ? updateExercise : createExercise
  const [state, formAction, pending] = useActionState(
    async (prevState: ExerciseFormState, formData: FormData) => {
      const result = await action(prevState, formData)
      if (result.success) {
        setOpen(false)
        if (!isEditing) {
          setName('')
          setMuscleGroup(null)
          setEquipment(null)
        }
      }
      return result
    },
    initialState,
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar exercício' : 'Novo exercício'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere os dados do exercício que você criou.'
              : 'Crie o seu quando não encontrar o exercício no catálogo.'}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {exercise && <input type="hidden" name="id" value={exercise.id} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise-name">Nome</Label>
            <Input
              id="exercise-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Supino com pegada invertida"
              maxLength={80}
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise-muscle-group">Grupo muscular</Label>
            <Select
              name="muscleGroup"
              value={muscleGroup}
              onValueChange={(value) => setMuscleGroup(value)}
              items={muscleGroupLabels}
            >
              <SelectTrigger id="exercise-muscle-group">
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(MuscleGroup).map((group) => (
                  <SelectItem key={group} value={group}>
                    {muscleGroupLabels[group]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.muscleGroup && (
              <p className="text-sm text-destructive">
                {state.errors.muscleGroup[0]}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise-equipment">Equipamento</Label>
            <Select
              name="equipment"
              value={equipment}
              onValueChange={(value) => setEquipment(value)}
              items={equipmentLabels}
            >
              <SelectTrigger id="exercise-equipment">
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Equipment).map((equipmentOption) => (
                  <SelectItem key={equipmentOption} value={equipmentOption}>
                    {equipmentLabels[equipmentOption]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.equipment && (
              <p className="text-sm text-destructive">
                {state.errors.equipment[0]}
              </p>
            )}
          </div>
          {state.errors?.form && (
            <p className="text-sm text-destructive">{state.errors.form[0]}</p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
