import { NotificationCenter } from '@/components/notifications/notification-center'
import Navbar from '@/components/navbar/navbar'

export default function NotificationsPage() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus notificaciones
          </p>
        </div>
        <NotificationCenter />
      </main>
    </div>
  )
} 