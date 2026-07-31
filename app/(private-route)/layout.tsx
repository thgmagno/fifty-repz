import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { StartWorkoutFab } from '@/components/start-workout-fab'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <nav className="flex justify-between">
          <SidebarTrigger size="icon-lg" />
          <ThemeToggle />
        </nav>
        {/* pb extra: espaço para o botão flutuante não cobrir o conteúdo */}
        <section className="min-w-0 flex-1 px-2 pb-24">{children}</section>
      </main>
      <StartWorkoutFab />
    </SidebarProvider>
  )
}
