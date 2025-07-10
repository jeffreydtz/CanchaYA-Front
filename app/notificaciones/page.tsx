import { Navbar } from "@/components/navbar"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { NotificationDemo } from "@/components/notifications/notification-demo"
import { getServerUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notificaciones - CanchaYA',
  description: 'Centro de notificaciones para gestionar todas tus alertas y actualizaciones de reservas.',
}

export default async function NotificationsPage() {
  const user = await getServerUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <NotificationDemo />
        <NotificationCenter />
      </main>
    </div>
  )
} 