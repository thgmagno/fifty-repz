import { AppSidebarNav } from '@/components/app-sidebar-nav'
import { getUser } from '@/lib/dal'

export async function AppSidebar() {
  const user = await getUser()

  return <AppSidebarNav user={user} />
}
