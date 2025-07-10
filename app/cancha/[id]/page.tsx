import { Suspense } from 'react'
import CourtDetail from '@/components/court/court-detail'
import Navbar from '@/components/navbar/navbar'

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CourtPage({ params }: PageProps) {
  const { id } = await params
  
  return <CourtDetail />
}
