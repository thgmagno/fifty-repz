import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fifty Repz",
    template: "%s | Fifty Repz",
  },
  description: "Monte seus treinos, registre suas séries e acompanhe a evolução dos seus amigos. Complete seus fifty repz e suba de nível.",
  applicationName: "Fifty Repz",
  keywords: ["treino", "academia", "musculação", "fitness", "workout tracker", "social fitness"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fifty Repz",
  },
  openGraph: {
    type: "website",
    siteName: "Fifty Repz",
    title: "Fifty Repz",
    description: "Treine, evolua e acompanhe seus amigos na academia.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col" cz-shortcut-listen="true">{children}</body>
    </html>
  );
}
