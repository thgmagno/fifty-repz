'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile, type ProfileFormState } from '@/lib/actions/profile'
import { privateRoutes } from '@/lib/config'

interface EditProfileFormProps {
  name: string | null
  image: string | null
  username: string
  bio: string | null
  // de onde o usuário veio: é para lá que ele volta ao salvar ou cancelar
  backTo: string
}

const initialState: ProfileFormState = {}

export function EditProfileForm({
  name,
  image,
  username,
  bio,
  backTo,
}: EditProfileFormProps) {
  const router = useRouter()
  const [nameValue, setNameValue] = useState(name ?? '')
  const [usernameValue, setUsernameValue] = useState(username)
  const [bioValue, setBioValue] = useState(bio ?? '')
  const [state, formAction, pending] = useActionState(
    async (prevState: ProfileFormState, formData: FormData) => {
      const result = await updateProfile(prevState, formData)
      if (result.success) {
        const newUsername = String(formData.get('username') ?? '')
        // o endereço do perfil tem o usuário dentro: trocar de usuário
        // invalida a origem, e o destino passa a ser o perfil novo
        router.push(
          newUsername === username
            ? backTo
            : `${privateRoutes.profile}/${newUsername}`,
        )
      }
      return result
    },
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name ?? username}
            className="size-14 rounded-full"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-xl">
            🏋️
          </div>
        )}
        {/* a foto não é editável aqui, e antes nada dizia de onde ela vinha */}
        <p className="text-sm text-muted-foreground">
          Sua foto vem da conta do Google. Para trocar, mude por lá.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">Nome exibido</Label>
        <Input
          id="profile-name"
          name="name"
          value={nameValue}
          onChange={(event) => setNameValue(event.target.value)}
          placeholder="Como você quer aparecer para as outras pessoas"
          maxLength={60}
        />
        <p className="text-xs text-muted-foreground">
          É o nome que aparece no seu perfil e no feed. Em branco, aparece o seu
          nome de usuário.
        </p>
        {state.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-username">Nome de usuário</Label>
        <Input
          id="profile-username"
          name="username"
          value={usernameValue}
          onChange={(event) => setUsernameValue(event.target.value)}
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
          value={bioValue}
          onChange={(event) => setBioValue(event.target.value)}
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

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : 'Salvar'}
        </Button>
        <Link href={backTo} className={buttonVariants({ variant: 'ghost' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
