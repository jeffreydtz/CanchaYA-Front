'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Por favor ingresa un email válido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual forgot password API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setEmailSent(true)
      toast.success('Email enviado', {
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      })
    } catch {
      toast.error('Error al enviar el email', {
        description: 'Intenta nuevamente en unos momentos.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Email Enviado
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                Te hemos enviado un enlace para restablecer tu contraseña
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hemos enviado un enlace de restablecimiento de contraseña a:
                </p>
                <p className="font-semibold text-primary">
                  {email}
                </p>
                <p className="text-xs text-gray-500">
                  Si no ves el email en unos minutos, revisa tu carpeta de spam.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Login
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full text-sm" 
                  onClick={() => setEmailSent(false)}
                >
                  Enviar a otro email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Ingresa tu email y te enviaremos un enlace para restablecerla
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                  disabled={isLoading}
                  className={`h-12 pl-4 pr-4 text-base border-2 rounded-xl transition-all duration-300 ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500' 
                      : email 
                      ? 'border-primary/50 focus:border-primary' 
                      : 'border-gray-200 focus:border-primary/50'
                  } ${isLoading ? 'opacity-50' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Send className="h-5 w-5 mr-2 animate-pulse" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Enviar enlace de restablecimiento
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}