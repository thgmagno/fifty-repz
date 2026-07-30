import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { SidebarMobileNavListener } from '@/components/sidebar-mobile-nav-listener'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarMobileNavListener />
      <AppSidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <nav className="flex justify-between">
          <SidebarTrigger size="icon-lg" />
          <ThemeToggle />
        </nav>
        <section className="min-w-0 flex-1 px-2 pb-10">{children}</section>
      </main>
    </SidebarProvider>
  )
}
