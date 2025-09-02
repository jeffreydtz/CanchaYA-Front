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
    console.log('Form submit - attempting login for:', data.email)
    
    try {
      const success = await login(data.email, data.password)
      console.log('Login attempt result:', success)
      
      if (success) {
        toast.success('¡Bienvenido de vuelta!', {
          description: 'Has iniciado sesión exitosamente.',
        })
        
        console.log('Login successful, redirecting in 1.5 seconds...')
        // Wait a bit longer for auth context to update, then redirect
        setTimeout(() => {
          console.log('Redirecting to home page...')
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        }, 1500)
      } else {
        console.log('Login failed - credentials invalid or server error')
        toast.error('Error al iniciar sesión', {
          description: 'Verifica tus credenciales e intenta nuevamente.',
        })
      }
    } catch (error) {
      console.error('Login error in form:', error)
      toast.error('Error al iniciar sesión', {
        description: 'Verifica tus credenciales e intenta nuevamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Inicia sesión para continuar con CanchaYA
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl animate-scale-in">
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
                className="w-full h-12 text-base font-semibold rounded-xl relative overflow-hidden group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">o</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 border-2 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                disabled={isLoading}
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
            </div>

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