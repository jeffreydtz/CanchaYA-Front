import { Metadata } from 'next'
import ChallengesList from '@/components/challenges/challenges-list'

export const metadata: Metadata = {
  title: 'Desafíos | CanchaYA',
  description: 'Gestiona tus desafíos deportivos y competiciones',
}

export default function DesafiosPage() {
  return (
    <div className="container mx-auto py-8">
      <ChallengesList />
    </div>
  )
}
