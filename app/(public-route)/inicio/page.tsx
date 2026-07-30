import { HeroSection } from '@/components/landing/hero-section'
import { FeatureCards } from '@/components/landing/feature-cards'
import { OpenSourceSection } from '@/components/landing/open-source-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export default async function Inicio({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-svh flex-col">
      <HeroSection error={error} />
      <FeatureCards />
      <OpenSourceSection />
      <LandingFooter />
    </main>
  )
}
