'use client'

import Link from 'next/link'
import {
  ClipboardListIcon,
  DumbbellIcon,
  HistoryIcon,
  HomeIcon,
  LayersIcon,
  LogOut,
  RssIcon,
  SearchIcon,
  UserIcon,
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
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/auth'
import { privateRoutes } from '@/lib/config'
import type { getUser } from '@/lib/dal'

// A ordem segue a hierarquia do app: um plano reúne treinos, e um treino
// reúne exercícios.
const navItems = [
  { title: 'Início', href: privateRoutes.dashboard, icon: HomeIcon },
  { title: 'Planos de treino', href: privateRoutes.plans, icon: LayersIcon },
  { title: 'Treinos', href: privateRoutes.workouts, icon: ClipboardListIcon },
  { title: 'Exercícios', href: privateRoutes.exercises, icon: DumbbellIcon },
  { title: 'Histórico', href: privateRoutes.history, icon: HistoryIcon },
]

export function AppSidebarNav({
  user,
}: {
  user: Awaited<ReturnType<typeof getUser>>
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  // "Perfil" aponta para o perfil público do próprio usuário, que é onde
  // também fica a edição do perfil
  const socialNavItems = [
    {
      title: 'Perfil',
      href: `${privateRoutes.profile}/${user.username}`,
      icon: UserIcon,
    },
    { title: 'Feed', href: privateRoutes.feed, icon: RssIcon },
    { title: 'Buscar pessoas', href: privateRoutes.search, icon: SearchIcon },
  ]

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
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    onClick={closeMobileSidebar}
                  >
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
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    onClick={closeMobileSidebar}
                  >
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
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
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
