import { HeartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleLike } from '@/lib/actions/likes'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  sessionId: string
  likeCount: number
  likedByMe: boolean
}

export function LikeButton({
  sessionId,
  likeCount,
  likedByMe,
}: LikeButtonProps) {
  return (
    <form action={toggleLike}>
      <input type="hidden" name="sessionId" value={sessionId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={cn(likedByMe && 'text-destructive')}
      >
        <HeartIcon className={cn(likedByMe && 'fill-current')} />
        {likeCount}
      </Button>
    </form>
  )
}
