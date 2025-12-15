/**
 * Register Form Component for CanchaYA
 * Implements user registration with validation and real backend integration
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { setAuthTokens } from '@/lib/auth'
import Link from 'next/link'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import { Eye, EyeOff } from 'lucide-react'

const registerSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'La contraseña debe tener al menos un símbolo especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // Validadores de requisitos de contraseña
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const response = await apiClient.register({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: data.password,
      })
      
      if (response.error) {
        // Si el error es un objeto con array de errores
        if (typeof response.error === 'string') {
          try {
            const errorData = JSON.parse(response.error)
            if (errorData.errors && Array.isArray(errorData.errors)) {
              // Mostrar cada error del backend
              errorData.errors.forEach((err: string) => {
                toast.error(err)
              })
              return
            }
          } catch {
            // Si no se puede parsear, mostrar el error como string
            toast.error(response.error)
            return
          }
        }
        toast.error(response.error)
        return
      }

      if (response.data) {
        // New API returns { userId, accessToken, refreshToken }
        const { accessToken, refreshToken } = response.data
        if (accessToken && refreshToken) {
          // Save tokens and redirect to home (user is now logged in)
          setAuthTokens(accessToken, refreshToken)
          toast.success('¡Registro exitoso! Bienvenido a CanchaYA.')
          router.push('/')
        } else {
          // Fallback: redirect to login if tokens aren't provided
          toast.success('¡Registro exitoso! Por favor inicia sesión.')
          router.push('/login')
        }
      } else {
        toast.error('Error en el registro')
      }
    } catch (error: any) {
      // Intentar extraer errores del backend
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: string) => {
          toast.error(err)
        })
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('Error del servidor. Intenta nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registrarse</CardTitle>
        <CardDescription>
          Crea una nueva cuenta para acceder a CanchaYA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Juan"
                {...register('nombre')}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
              {errors.nombre && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Apellido</Label>
              <Input
                id="apellido"
                type="text"
                placeholder="Pérez"
                {...register('apellido')}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
              {errors.apellido && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              disabled={isLoading}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  onChange: (e) => setPassword(e.target.value)
                })}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}

            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={password} showRequirements={true} size="md" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
