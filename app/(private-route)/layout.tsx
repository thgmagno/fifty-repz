import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <SidebarTrigger />
        <section className="min-w-0 flex-1 px-2 pb-10">{children}</section>
      </main>
    </SidebarProvider>
  )
}
