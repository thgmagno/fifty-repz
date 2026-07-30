'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'

// Fecha o sidebar mobile (Sheet) sempre que a rota muda, já que ele não
// fecha sozinho ao navegar por um item de menu.
export function SidebarMobileNavListener() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return null
}
