import Link from 'next/link'
import {
  ClipboardListIcon,
  DumbbellIcon,
  HistoryIcon,
  HomeIcon,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { getUser } from '@/lib/dal'
import { logout } from '@/lib/actions/auth'
import { privateRoutes } from '@/lib/config'

const navItems = [
  { title: 'Dashboard', href: privateRoutes.dashboard, icon: HomeIcon },
  { title: 'Exercícios', href: privateRoutes.exercises, icon: DumbbellIcon },
  { title: 'Treinos', href: privateRoutes.workouts, icon: ClipboardListIcon },
  { title: 'Histórico', href: privateRoutes.history, icon: HistoryIcon },
]

export async function AppSidebar() {
  const user = await getUser()

  return (
    <Sidebar>
      <SidebarHeader>
        <span className="px-2 py-1.5 font-bold">Fifty Repz</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Treino</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5">
          {user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? user.email}
              className="size-8 rounded-full"
            />
          )}
          <div className="flex min-w-0 flex-col text-sm">
            <span className="truncate font-medium">
              {user.name ?? user.email}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-destructive/80 hover:text-destructive"
          >
            <LogOut />
            Sair
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
