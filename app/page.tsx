import Hero from '@/components/Hero'
import FeaturedProperty from '@/components/FeaturedProperty'
import PropertyListings from '@/components/PropertyListings'
import MarketAnalysis from '@/components/MarketAnalysis'
import Testimonials from '@/components/Testimonials'

export default function Home() {
  return (
    <div className='min-h-screen w-screen'>
      <Hero />
      <FeaturedProperty />
      <PropertyListings />
      <MarketAnalysis />
      <Testimonials />
    </div>
  )
}

