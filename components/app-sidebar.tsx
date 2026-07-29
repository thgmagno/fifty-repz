import { LogOut } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/dal"
import { logout } from "@/lib/actions/auth"

  export async function AppSidebar() {
    const user = await getUser()

    return (
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroup />
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
              <span className="truncate font-medium">{user.name ?? user.email}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" className="w-full justify-start">
              <LogOut />
              Sair
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>
    )
  }
