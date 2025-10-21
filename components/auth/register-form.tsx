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
      console.error('Registration error:', error)
      
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
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                onChange: (e) => setPassword(e.target.value)
              })}
              disabled={isLoading}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
            
            {/* Indicador de requisitos con colores */}
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Requisitos de contraseña:</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                    passwordRequirements.minLength 
                      ? 'bg-green-500' 
                      : password.length > 0 
                        ? 'bg-red-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {passwordRequirements.minLength && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs transition-colors ${
                    passwordRequirements.minLength 
                      ? 'text-green-600 dark:text-green-400 font-medium' 
                      : password.length > 0 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Mínimo 8 caracteres
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                    passwordRequirements.hasUpperCase 
                      ? 'bg-green-500' 
                      : password.length > 0 
                        ? 'bg-red-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {passwordRequirements.hasUpperCase && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs transition-colors ${
                    passwordRequirements.hasUpperCase 
                      ? 'text-green-600 dark:text-green-400 font-medium' 
                      : password.length > 0 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Al menos una letra mayúscula (A-Z)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                    passwordRequirements.hasLowerCase 
                      ? 'bg-green-500' 
                      : password.length > 0 
                        ? 'bg-red-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {passwordRequirements.hasLowerCase && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs transition-colors ${
                    passwordRequirements.hasLowerCase 
                      ? 'text-green-600 dark:text-green-400 font-medium' 
                      : password.length > 0 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Al menos una letra minúscula (a-z)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                    passwordRequirements.hasNumber 
                      ? 'bg-green-500' 
                      : password.length > 0 
                        ? 'bg-red-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {passwordRequirements.hasNumber && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs transition-colors ${
                    passwordRequirements.hasNumber 
                      ? 'text-green-600 dark:text-green-400 font-medium' 
                      : password.length > 0 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Al menos un número (0-9)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                    passwordRequirements.hasSymbol 
                      ? 'bg-green-500' 
                      : password.length > 0 
                        ? 'bg-red-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {passwordRequirements.hasSymbol && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs transition-colors ${
                    passwordRequirements.hasSymbol 
                      ? 'text-green-600 dark:text-green-400 font-medium' 
                      : password.length > 0 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Al menos un símbolo especial (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={isLoading}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
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
