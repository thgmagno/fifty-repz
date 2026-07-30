'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // instalação do PWA é um enhancement; falha de registro não deve
      // impedir o uso normal do app
    })
  }, [])

  return null
}
