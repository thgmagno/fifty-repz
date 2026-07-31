import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { RegisterServiceWorker } from '@/components/register-service-worker'
import { SplashScreen } from '@/components/splash-screen'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Fifty Repz',
    template: '%s | Fifty Repz',
  },
  description:
    'Monte seus treinos, registre suas séries e acompanhe a evolução dos seus amigos. Complete seus fifty repz e suba de nível.',
  applicationName: 'Fifty Repz',
  keywords: [
    'treino',
    'academia',
    'musculação',
    'fitness',
    'workout tracker',
    'social fitness',
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fifty Repz',
  },
  openGraph: {
    type: 'website',
    siteName: 'Fifty Repz',
    title: 'Fifty Repz',
    description: 'Treine, evolua e acompanhe seus amigos na academia.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#14120f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SplashScreen />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  )
}
