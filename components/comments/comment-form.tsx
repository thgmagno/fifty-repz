'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment, type CommentFormState } from '@/lib/actions/comments'

interface CommentFormProps {
  sessionId: string
}

const initialState: CommentFormState = {}

export function CommentForm({ sessionId }: CommentFormProps) {
  const [body, setBody] = useState('')
  const [state, formAction, pending] = useActionState(
    async (prevState: CommentFormState, formData: FormData) => {
      const result = await createComment(prevState, formData)
      if (result.success) setBody('')
      return result
    },
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="sessionId" value={sessionId} />
      <Textarea
        name="body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Deixe um comentário…"
        maxLength={500}
        rows={2}
      />
      {state.errors?.body && (
        <p className="text-sm text-destructive">{state.errors.body[0]}</p>
      )}
      {state.errors?.form && (
        <p className="text-sm text-destructive">{state.errors.form[0]}</p>
      )}
      <Button type="submit" size="sm" disabled={pending} className="self-end">
        {pending ? 'Enviando…' : 'Comentar'}
      </Button>
    </form>
  )
}
