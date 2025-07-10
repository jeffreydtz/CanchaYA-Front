/**
 * Dashboard Page for CanchaYA
 * Main landing page with hero section, search filters, and featured courts
 * Implements authentication checks and real-time updates
 */

import { Suspense } from 'react'
import HeroSection from '@/components/dashboard/hero-section'
import CourtFilters from '@/components/dashboard/court-filters'
import FeaturedCourts from '@/components/dashboard/featured-courts'
import Navbar from '@/components/navbar/navbar'

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <HeroSection />
          <CourtFilters />
          <FeaturedCourts />
        </Suspense>
      </main>
    </div>
  )
}
