import { Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteComment } from '@/lib/actions/comments'
import { formatSessionDate } from '@/lib/utils'
import type { CommentItem } from '@/lib/comments'

interface CommentListProps {
  sessionId: string
  comments: CommentItem[]
}

export function CommentList({ sessionId, comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum comentário ainda. Seja o primeiro a comentar.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {comments.map((comment) => (
        <li key={comment.id} className="flex items-start gap-2">
          {comment.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.user.image}
              alt={comment.user.name ?? comment.user.username}
              className="size-8 rounded-full"
            />
          )}
          <div className="flex-1 rounded-md border p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {comment.user.name ?? `@${comment.user.username}`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatSessionDate(comment.createdAt)}
                </span>
                {comment.isOwn && (
                  <form action={deleteComment}>
                    <input
                      type="hidden"
                      name="commentId"
                      value={comment.id}
                    />
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive/80 hover:text-destructive"
                    >
                      <Trash2Icon />
                      <span className="sr-only">Excluir comentário</span>
                    </Button>
                  </form>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm">{comment.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
