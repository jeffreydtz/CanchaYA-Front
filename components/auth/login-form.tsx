/**
 * Login Form Component for CanchaYA
 * Modern login form with enhanced UX, validation, and visual feedback
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
import { useAuth } from './auth-context'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, Shield, Sparkles } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import { JWTPayload } from '@/lib/api-client'

const loginSchema = z.object({
  email: z.string().email('Por favor ingresa un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const email = watch('email')
  const password = watch('password')

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const success = await login(data.email, data.password)

      if (success) {
        toast.success('¡Bienvenido de vuelta!', {
          description: 'Has iniciado sesión exitosamente.',
        })

        // Get token from cookie to determine role and redirect
        const rawTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]

        let redirectPath = '/'

        if (rawTokenCookie) {
          try {
            // Decode the cookie value since it's URL-encoded
            const token = decodeURIComponent(rawTokenCookie)
            const decoded = jwtDecode<JWTPayload>(token)
            // Redirect based on role - admin and admin-club go to admin panel, all others to home
            // Note: System supports additional roles beyond these, but only admin/admin-club have admin panel access
            if (decoded.rol === 'admin') {
              redirectPath = '/admin/dashboard' // Global admin - full access
            } else if (decoded.rol === 'admin-club') {
              redirectPath = '/admin/dashboard' // Club-specific admin - filtered access
            } else {
              // All other roles (usuario, and any other system/business roles) redirect to home
              redirectPath = '/'
            }
          } catch (decodeError) {
            console.error('Error decoding token for redirect:', decodeError)
            // Fall back to home if we can't decode
            redirectPath = '/'
          }
        }

        // Use a small delay to ensure auth context is updated before redirect
        setTimeout(() => {
          router.push(redirectPath)
        }, 100)
      } else {
        toast.error('Error al iniciar sesión', {
          description: 'Verifica tus credenciales e intenta nuevamente.',
        })
        setIsLoading(false)
      }
    } catch {
      toast.error('Error al iniciar sesión', {
        description: 'Verifica tus credenciales e intenta nuevamente.',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-luxury relative overflow-hidden p-4">
      {/* Glamorous Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-gold/10 via-transparent to-secondary/10" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              <div className="h-20 w-20 metallic-gold rounded-2xl flex items-center justify-center shadow-glow-gold-lg group-hover:shadow-glow-gold-lg transition-all duration-500 animate-float-smooth">
                <Shield className="h-10 w-10 text-black" />
              </div>
              <div className="absolute inset-0 bg-gradient-gold rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-pulse-gold" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-gold animate-glow-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-display font-black text-gradient-luxury mb-3 animate-scale-in">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-luxury text-lg">
            Inicia sesión para continuar con <span className="text-gold font-bold">CanchaYA</span>
          </p>
        </div>

        <Card className="border-2 border-gold/30 shadow-luxury-lg glass-luxury animate-scale-in hover:shadow-glow-gold-lg transition-all duration-500">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Accede a tu cuenta para reservar canchas
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    {...register('email')}
                    disabled={isLoading}
                    className={`h-12 pl-4 pr-4 text-base border-2 rounded-xl transition-all duration-300 bg-white dark:bg-white text-black font-bold ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : email 
                        ? 'border-primary/50 focus:border-primary' 
                        : 'border-gray-200 focus:border-primary/50'
                    } ${isLoading ? 'opacity-50' : ''}`}
                  />
                  {email && !errors.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 font-medium animate-fade-in">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading}
                    className={`h-12 pl-4 pr-12 text-base border-2 rounded-xl transition-all duration-300 bg-white dark:bg-white text-black font-bold ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500' 
                        : password 
                        ? 'border-primary/50 focus:border-primary' 
                        : 'border-gray-200 focus:border-primary/50'
                    } ${isLoading ? 'opacity-50' : ''}`}
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
                  <p className="text-sm text-red-600 font-medium animate-fade-in">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="btn-luxury w-full h-14 text-base font-luxury font-black rounded-xl shadow-glow-gold hover:shadow-glow-gold-lg tracking-wider relative overflow-hidden group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin relative z-10" />
                    <span className="relative z-10">Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Iniciar Sesión</span>
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-all duration-500 relative z-10" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ¿No tienes una cuenta?{' '}
                <Link 
                  href="/register" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p>
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" className="underline hover:text-primary">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="underline hover:text-primary">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}