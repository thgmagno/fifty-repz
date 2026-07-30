import Link from 'next/link'
import {
  ClipboardListIcon,
  DumbbellIcon,
  HistoryIcon,
  HomeIcon,
  LogOut,
  PencilIcon,
  RssIcon,
  SearchIcon,
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

const socialNavItems = [
  { title: 'Feed', href: privateRoutes.feed, icon: RssIcon },
  { title: 'Buscar pessoas', href: privateRoutes.search, icon: SearchIcon },
]

export async function AppSidebar() {
  const user = await getUser()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="font-bold">Fifty Repz</span>
        </div>
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
        <SidebarGroup>
          <SidebarGroupLabel>Social</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialNavItems.map((item) => (
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
        <Link
          href={`${privateRoutes.profile}/${user.username}`}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent"
        >
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
              @{user.username}
            </span>
          </div>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start"
          nativeButton={false}
          render={<Link href={privateRoutes.editProfile} />}
        >
          <PencilIcon />
          Editar perfil
        </Button>
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
