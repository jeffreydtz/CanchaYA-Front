import { NotificationCenter } from '@/components/notifications/notification-center'
import Navbar from '@/components/navbar/navbar'

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

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