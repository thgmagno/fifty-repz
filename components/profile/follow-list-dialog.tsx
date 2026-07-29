'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { privateRoutes } from '@/lib/config'
import type { FollowListItem } from '@/lib/follow'

interface FollowListDialogProps {
  title: string
  trigger: ReactElement
  users: FollowListItem[]
}

export function FollowListDialog({
  title,
  trigger,
  users,
}: FollowListDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ninguém por aqui ainda.
          </p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  href={`${privateRoutes.profile}/${user.username}`}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-muted"
                >
                  {user.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name ?? user.username}
                      className="size-9 rounded-full"
                    />
                  )}
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">
                      {user.name ?? `@${user.username}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
