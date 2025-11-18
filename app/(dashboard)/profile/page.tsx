/**
 * Profile Page for CanchaYA
 * User profile management with real backend integration
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Edit,
  Save,
  X,
  Settings,
  Bell,
  Lock,
  Trophy,
  Clock,
  Target,
  Award,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'
import apiClient, { User as UserType, Reserva, DisponibilidadPersona, PerfilCompetitivo } from '@/lib/api-client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Navbar from '@/components/navbar/navbar'

const profileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

function ProfileForm() {
  const { user, refreshUser, personaId } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user || !personaId) {
      toast.error('No se pudo obtener la información del usuario')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.updatePersona(personaId, {
        nombre: data.nombre,
        email: data.email,
      })

      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success('Perfil actualizado correctamente')
        await refreshUser()
        setIsEditing(false)
      }
    } catch (error: any) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo debe ser menor a 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo debe ser una imagen')
        return
      }

      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !personaId) return

    setUploadingAvatar(true)
    try {
      const response = await apiClient.uploadPersonaAvatar(personaId, avatarFile)

      if (response.error) {
        // Handle specific error codes
        if (response.status === 403) {
          toast.error('No tienes permiso para actualizar este avatar')
        } else if (response.status === 404) {
          toast.error('Persona no encontrada')
        } else if (response.status === 400) {
          toast.error('Archivo inválido. Debe ser JPEG o PNG menor a 5MB')
        } else {
          toast.error(response.error)
        }
      } else {
        toast.success('Avatar actualizado correctamente')
        await refreshUser()
        setAvatarFile(null)
        setAvatarPreview(null)
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Error al subir el avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      reset({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono || '',
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return <ProfileSkeleton />
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50">
                <AvatarImage
                  src={avatarPreview || user.avatarUrl || '/placeholder-user.png'}
                  alt={user.nombre}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-secondary text-white">
                  {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Upload overlay */}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Edit className="h-6 w-6 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-xl font-semibold">{user?.nombre || 'Usuario'}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={user.rol === 'admin' ? 'default' : 'secondary'}>
                  {user.rol === 'admin' ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Administrador
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Jugador
                    </>
                  )}
                </Badge>
                <Badge variant={user.activo ? 'default' : 'destructive'}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Miembro desde {new Date(user.fechaCreacion).toLocaleDateString()}
              </p>
              {/* Avatar upload button */}
              {avatarFile && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? 'Subiendo...' : 'Subir Avatar'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(null)
                    }}
                    disabled={uploadingAvatar}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="nombre"
                  {...register('nombre')}
                  disabled={!isEditing || loading}
                  className={`pl-10 bg-white dark:bg-white text-black font-bold ${!isEditing ? 'opacity-70' : ''}`}
                />
              </div>
              {errors.nombre && (
                <p className="text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isEditing || loading}
                  className={`pl-10 bg-white dark:bg-white text-black font-bold ${!isEditing ? 'opacity-70' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="telefono"
                  {...register('telefono')}
                  disabled={!isEditing || loading}
                  className={`pl-10 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              {errors.telefono && (
                <p className="text-sm text-red-600">{errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>ID de Usuario</Label>
              <div className="relative">
                <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={user.id}
                  disabled
                  className="pl-10 bg-white dark:bg-white text-black font-bold opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentReservas = async () => {
      try {
        const response = await apiClient.getReservas()
        if (response.data && Array.isArray(response.data)) {
          // Get the 5 most recent reservations - sort by fechaHora instead
          const recent = response.data
            .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
            .slice(0, 5)
          setReservas(recent)
        }
      } catch (error) {
        console.error('Error fetching recent reservations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentReservas()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reservas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    Reserva en {reserva.disponibilidad?.cancha?.nombre}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(reserva.fechaHora).toLocaleString()}
                  </p>
                </div>
                <Badge 
                  variant={reserva.estado === 'confirmada' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {reserva.estado}
                </Badge>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link href="/mis-reservas">
            <Button variant="outline" size="sm">
              Ver todas las reservas
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function CompetitiveProfile() {
  const [perfil, setPerfil] = useState<PerfilCompetitivo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await apiClient.getPerfilCompetitivo()
        if (response.data && response.data.length > 0) {
          setPerfil(response.data[0]) // Get first competitive profile
        }
      } catch (error) {
        console.error('Error fetching competitive profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerfil()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Perfil Competitivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!perfil) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Perfil Competitivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No tienes perfil competitivo aún</p>
            <p className="text-sm text-gray-400">Participa en partidos para generar tu ranking ELO</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Perfil Competitivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ELO Rating */}
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Rating ELO</h3>
              <p className="text-3xl font-black text-blue-800 dark:text-blue-200">{perfil.elo}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Deporte: {perfil.deporte?.nombre}</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-full">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200/50 dark:border-green-700/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Victorias</span>
            </div>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">{perfil.partidosGanados}</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-red-200/50 dark:border-red-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900 dark:text-red-100">Derrotas</span>
            </div>
            <p className="text-2xl font-bold text-red-800 dark:text-red-200">{perfil.partidosPerdidos}</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{perfil.partidosJugados}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-purple-200/50 dark:border-purple-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {perfil.partidosJugados > 0 ? Math.round((perfil.partidosGanados / perfil.partidosJugados) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Recent Performance */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Rendimiento Reciente</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ 
                  width: `${perfil.partidosJugados > 0 ? (perfil.partidosGanados / perfil.partidosJugados) * 100 : 0}%` 
                }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {perfil.partidosGanados}/{perfil.partidosJugados}
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
          Perfil competitivo del deporte: {perfil.deporte?.nombre}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileStats() {
  const [stats, setStats] = useState({
    totalReservas: 0,
    reservasConfirmadas: 0,
    reservasPendientes: 0,
  })
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getReservas()
        if (response.data) {
          const reservas = response.data
          setStats({
            totalReservas: reservas.length,
            reservasConfirmadas: reservas.filter(r => r.estado === 'confirmada').length,
            reservasPendientes: reservas.filter(r => r.estado === 'pendiente').length,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total de Reservas',
      value: stats.totalReservas,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Confirmadas',
      value: stats.reservasConfirmadas,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pendientes',
      value: stats.reservasPendientes,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {stat.title}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Inicia sesión para ver tu perfil</h2>
            <p className="text-gray-600 mb-4">
              Necesitas estar autenticado para acceder a esta página.
            </p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestiona tu información personal y configuraciones de cuenta
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <ProfileStats />
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="competitive">Competitivo</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="space-y-6">
              <ProfileForm />
              {/* Debt Status */}
              {user?.deudaPendiente && user.deudaPendiente > 0 && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                      <Target className="h-5 w-5" />
                      Estado de Cuenta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-red-900 dark:text-red-100">Deuda Pendiente:</span>
                        <span className="text-2xl font-bold text-red-800 dark:text-red-200">
                          ${user.deudaPendiente}
                        </span>
                      </div>
                      <div className="p-3 bg-red-100 dark:bg-red-800/30 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          ⚠️ No podrás hacer nuevas reservas hasta saldar tu deuda pendiente.
                        </p>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Pagar Deuda
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <RecentActivity />
          </TabsContent>

          <TabsContent value="competitive" className="mt-6">
            <CompetitiveProfile />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                    Configuración de notificaciones próximamente disponible
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                    Configuración de seguridad próximamente disponible
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}