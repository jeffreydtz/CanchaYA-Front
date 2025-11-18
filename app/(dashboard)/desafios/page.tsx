'use client'

import Navbar from '@/components/navbar/navbar'
import ChallengesList from '@/components/challenges/challenges-list'

export default function DesafiosPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <ChallengesList />
      </div>
    </>
  )
}
