"use client"

/**
 * Notification Center Component for CanchaYA
 * Full-featured notification management interface
 */

import React, { useState, useMemo } from 'react'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  X, 
  Clock, 
  AlertCircle, 
  Info, 
  Search,
  Filter,
  Calendar,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNotifications } from './notification-provider'
import { NotificationData } from '@/lib/notifications'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAllNotifications 
  } = useNotifications()

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'RESERVATION_CONFIRMED':
        return <Check className="h-5 w-5 text-green-600" />
      case 'RESERVATION_CANCELLED':
        return <X className="h-5 w-5 text-red-600" />
      case 'SLOT_RELEASED':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'PAYMENT_CONFIRMED':
        return <CheckCheck className="h-5 w-5 text-green-600" />
      case 'REMINDER':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: NotificationData['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getNotificationTypeLabel = (type: NotificationData['type']) => {
    switch (type) {
      case 'RESERVATION_CONFIRMED': return 'Reserva Confirmada'
      case 'RESERVATION_CANCELLED': return 'Reserva Cancelada'
      case 'SLOT_RELEASED': return 'Horario Liberado'
      case 'PAYMENT_CONFIRMED': return 'Pago Confirmado'
      case 'REMINDER': return 'Recordatorio'
      default: return 'Información'
    }
  }

  const formatNotificationDate = (dateString: string) => {
    const date = parseISO(dateString)
    
    if (isToday(date)) {
      return `Hoy ${format(date, 'HH:mm')}`
    } else if (isYesterday(date)) {
      return `Ayer ${format(date, 'HH:mm')}`
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
    }
  }

  // Filtered and sorted notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications.filter(notification => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Type filter
      if (typeFilter !== 'all' && notification.type !== typeFilter) {
        return false
      }

      // Status filter
      if (statusFilter === 'read' && !notification.read) return false
      if (statusFilter === 'unread' && notification.read) return false

      // Priority filter
      if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
        return false
      }

      return true
    })

    // Sort notifications
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'date') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [notifications, searchQuery, typeFilter, statusFilter, priorityFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(new Set(paginatedNotifications.map(n => n.id)))
    } else {
      setSelectedNotifications(new Set())
    }
  }

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotifications)
    if (checked) {
      newSelected.add(notificationId)
    } else {
      newSelected.delete(notificationId)
    }
    setSelectedNotifications(newSelected)
  }

  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id))
    await Promise.all(promises)
    setSelectedNotifications(new Set())
  }

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedNotifications).map(id => clearNotification(id))
    await Promise.all(promises)
    setSelectedNotifications(new Set())
  }

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Centro de Notificaciones</h1>
          <p className="text-muted-foreground">
            {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''} total
            {unreadCount > 0 && `, ${unreadCount} sin leer`}
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button onClick={clearAllNotifications} variant="outline" className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar todas
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="RESERVATION_CONFIRMED">Reservas Confirmadas</SelectItem>
                <SelectItem value="RESERVATION_CANCELLED">Reservas Canceladas</SelectItem>
                <SelectItem value="SLOT_RELEASED">Horarios Liberados</SelectItem>
                <SelectItem value="PAYMENT_CONFIRMED">Pagos</SelectItem>
                <SelectItem value="REMINDER">Recordatorios</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">No leídas</SelectItem>
                <SelectItem value="read">Leídas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [by, order] = value.split('-')
              setSortBy(by as 'date' | 'priority')
              setSortOrder(order as 'asc' | 'desc')
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Más recientes</SelectItem>
                <SelectItem value="date-asc">Más antiguas</SelectItem>
                <SelectItem value="priority-desc">Mayor prioridad</SelectItem>
                <SelectItem value="priority-asc">Menor prioridad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedNotifications.size} notificación{selectedNotifications.size !== 1 ? 'es' : ''} seleccionada{selectedNotifications.size !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button onClick={handleBulkMarkAsRead} size="sm" variant="outline">
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como leídas
                </Button>
                <Button onClick={handleBulkDelete} size="sm" variant="outline" className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
                <Button onClick={() => setSelectedNotifications(new Set())} size="sm" variant="ghost">
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {paginatedNotifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
                <p className="text-muted-foreground">
                  {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'No se encontraron notificaciones con los filtros aplicados.'
                    : 'No tienes notificaciones en este momento.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Checkbox
                checked={selectedNotifications.size === paginatedNotifications.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Seleccionar todas en esta página</span>
            </div>

            {paginatedNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={cn(
                  "transition-all cursor-pointer hover:shadow-md border-l-4",
                  !notification.read && "bg-muted/30 border-l-blue-500",
                  notification.read && "border-l-gray-200",
                  selectedNotifications.has(notification.id) && "ring-2 ring-blue-500"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedNotifications.has(notification.id)}
                      onCheckedChange={(checked) => 
                        handleSelectNotification(notification.id, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "font-medium",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                            {notification.priority === 'high' && 'Alta'}
                            {notification.priority === 'medium' && 'Media'}
                            {notification.priority === 'low' && 'Baja'}
                          </Badge>
                          <Badge variant="secondary">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatNotificationDate(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {notification.actionUrl && (
                            <Badge variant="outline" className="text-xs">
                              Acción disponible
                            </Badge>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              clearNotification(notification.id)
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
} 