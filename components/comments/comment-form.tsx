'use client'

import { useActionState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment, type CommentFormState } from '@/lib/actions/comments'

interface CommentFormProps {
  sessionId: string
}

const initialState: CommentFormState = {}

export function CommentForm({ sessionId }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(
    async (prevState: CommentFormState, formData: FormData) => {
      const result = await createComment(prevState, formData)
      if (result.success) formRef.current?.reset()
      return result
    },
    initialState,
  )

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="sessionId" value={sessionId} />
      <Textarea
        name="body"
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
