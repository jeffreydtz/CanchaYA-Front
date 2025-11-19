/**
 * Password Strength Indicator Component
 * Provides real-time feedback on password strength with visual indicators
 */

'use client'

import { Check, X } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
  size?: 'sm' | 'md' | 'lg'
}

interface PasswordRequirement {
  label: string
  regex: RegExp
  required: boolean
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: 'Al menos 8 caracteres',
    regex: /.{8,}/,
    required: true
  },
  {
    label: 'Mayúsculas (A-Z)',
    regex: /[A-Z]/,
    required: true
  },
  {
    label: 'Minúsculas (a-z)',
    regex: /[a-z]/,
    required: true
  },
  {
    label: 'Números (0-9)',
    regex: /\d/,
    required: true
  },
  {
    label: 'Caracteres especiales (!@#$%^&*)',
    regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    required: false
  }
]

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'

export function usePasswordStrength(password: string) {
  const checkRequirements = () => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.regex.test(password)
    }))
  }

  const getStrength = (): { strength: PasswordStrength; score: number } => {
    const requirements = checkRequirements()
    const metRequired = requirements.filter(r => r.required && r.met).length
    const totalRequired = requirements.filter(r => r.required).length
    const metOptional = requirements.filter(r => !r.required && r.met).length

    let score = 0

    // Base score from required requirements (0-60)
    score += (metRequired / totalRequired) * 60

    // Bonus from optional requirements (0-20)
    if (metOptional > 0) {
      score += 20
    }

    // Bonus for length (0-20)
    if (password.length >= 16) {
      score += 20
    } else if (password.length >= 12) {
      score += 10
    }

    let strength: PasswordStrength = 'weak'
    if (score >= 90) {
      strength = 'very-strong'
    } else if (score >= 75) {
      strength = 'strong'
    } else if (score >= 60) {
      strength = 'good'
    } else if (score >= 40) {
      strength = 'fair'
    }

    return { strength, score: Math.min(100, score) }
  }

  const requirements = checkRequirements()
  const { strength, score } = getStrength()

  return {
    strength,
    score,
    requirements,
    isValid: PASSWORD_REQUIREMENTS.filter(r => r.required).every(r =>
      requirements.find(req => req.label === r.label)?.met
    )
  }
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  size = 'md'
}: PasswordStrengthIndicatorProps) {
  const { strength, score, requirements, isValid } = usePasswordStrength(password)

  const getStrengthColor = () => {
    switch (strength) {
      case 'very-strong':
        return { bar: 'bg-green-600', text: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' }
      case 'strong':
        return { bar: 'bg-green-500', text: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' }
      case 'good':
        return { bar: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
      case 'fair':
        return { bar: 'bg-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' }
      default:
        return { bar: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' }
    }
  }

  const getStrengthLabel = () => {
    switch (strength) {
      case 'very-strong':
        return 'Muy Fuerte'
      case 'strong':
        return 'Fuerte'
      case 'good':
        return 'Buena'
      case 'fair':
        return 'Regular'
      default:
        return 'Débil'
    }
  }

  const colors = getStrengthColor()
  const sizeMap = {
    sm: { bar: 'h-1.5', text: 'text-xs', label: 'text-xs' },
    md: { bar: 'h-2', text: 'text-sm', label: 'text-sm' },
    lg: { bar: 'h-3', text: 'text-base', label: 'text-base' }
  }
  const sizeClass = sizeMap[size]

  if (!password) {
    return null
  }

  return (
    <div className={`space-y-2 p-3 rounded-lg ${colors.bg} border border-gray-200 dark:border-gray-700`}>
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className={`font-medium text-gray-700 dark:text-gray-300 ${sizeClass.label}`}>
            Seguridad de la Contraseña
          </label>
          <span className={`font-semibold ${colors.text} ${sizeClass.text}`}>
            {getStrengthLabel()}
          </span>
        </div>
        <Progress
          value={score}
          className={`${sizeClass.bar} bg-gray-200 dark:bg-gray-700`}
        />
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Requisitos:
          </p>
          <div className="space-y-1.5">
            {requirements.map((req) => {
              const met = req.met
              return (
                <div
                  key={req.label}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    met
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-400'
                  } ${req.required ? '' : 'opacity-75'}`}
                >
                  {met ? (
                    <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  )}
                  <span>
                    {req.label}
                    {!req.required && <span className="text-gray-400 dark:text-gray-600 ml-1">(Opcional)</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Validity Indicator */}
      {!showRequirements && password && (
        <div className={`text-xs font-medium mt-2 ${isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
          {isValid ? '✓ Contraseña válida' : '✗ Contraseña débil'}
        </div>
      )}
    </div>
  )
}
