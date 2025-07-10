import { Suspense } from 'react'
import MyReservations from '@/components/reservations/my-reservations'
import { LoadingError } from '@/components/error/loading-error'

export default function MisReservasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingError isLoading={true} />}>
          <MyReservations />
        </Suspense>
      </main>
    </div>
  )
}
