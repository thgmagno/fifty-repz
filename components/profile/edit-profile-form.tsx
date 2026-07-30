'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile, type ProfileFormState } from '@/lib/actions/profile'
import { privateRoutes } from '@/lib/config'

interface EditProfileFormProps {
  username: string
  bio: string | null
}

const initialState: ProfileFormState = {}

export function EditProfileForm({ username, bio }: EditProfileFormProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    async (prevState: ProfileFormState, formData: FormData) => {
      const result = await updateProfile(prevState, formData)
      if (result.success) {
        const newUsername = formData.get('username')
        router.push(`${privateRoutes.profile}/${newUsername}`)
      }
      return result
    },
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-username">Nome de usuário</Label>
        <Input
          id="profile-username"
          name="username"
          defaultValue={username}
          placeholder="Ex.: joao-silva"
          maxLength={30}
        />
        {state.errors?.username && (
          <p className="text-sm text-destructive">{state.errors.username[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-bio">Bio</Label>
        <Textarea
          id="profile-bio"
          name="bio"
          defaultValue={bio ?? ''}
          placeholder="Conte um pouco sobre seus treinos…"
          maxLength={280}
          rows={4}
        />
        {state.errors?.bio && (
          <p className="text-sm text-destructive">{state.errors.bio[0]}</p>
        )}
      </div>
      {state.errors?.form && (
        <p className="text-sm text-destructive">{state.errors.form[0]}</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Salvando…' : 'Salvar'}
      </Button>
    </form>
  )
}
