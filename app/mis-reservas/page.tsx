import { Suspense } from 'react'
import MyReservations from '@/components/reservations/my-reservations'
import Navbar from '@/components/navbar/navbar'

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MisReservasPage() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <MyReservations userId="user1" />
        </Suspense>
      </main>
    </div>
  )
}
