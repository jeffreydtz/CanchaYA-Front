/**
 * Email Configuration Form Component
 *
 * Permite configurar las opciones de email para alertas:
 * - Habilitar/deshabilitar emails
 * - Configurar destinatarios (to, cc, bcc)
 * - Seleccionar template de email
 * - Personalizar asunto y mensaje
 * - Opciones adicionales (incluir gráficos, datos históricos)
 */

'use client'

import { useState } from 'react'
import { EmailConfig, EmailTemplate } from '@/lib/analytics/types'
import { validateEmails, formatRecipients } from '@/lib/email/email-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Mail, Plus, X } from 'lucide-react'

interface EmailConfigFormProps {
  config?: EmailConfig
  onChange: (config: EmailConfig) => void
  onTest?: () => void
}

export function EmailConfigForm({ config, onChange, onTest }: EmailConfigFormProps) {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(
    config || {
      enabled: false,
      recipients: [],
      template: 'METRIC_THRESHOLD',
    }
  )

  const [newRecipient, setNewRecipient] = useState('')
  const [newCc, setNewCc] = useState('')
  const [newBcc, setNewBcc] = useState('')
  const [emailErrors, setEmailErrors] = useState<string[]>([])

  // Email templates options
  const templates: { value: EmailTemplate; label: string; description: string }[] = [
    {
      value: 'METRIC_THRESHOLD',
      label: 'Umbral de Métrica',
      description: 'Template estándar para alertas de umbral',
    },
    {
      value: 'ANOMALY_DETECTED',
      label: 'Anomalía Detectada',
      description: 'Para alertas de detección de anomalías',
    },
    {
      value: 'CRITICAL_ALERT',
      label: 'Alerta Crítica',
      description: 'Para alertas críticas que requieren atención inmediata',
    },
    {
      value: 'DAILY_SUMMARY',
      label: 'Resumen Diario',
      description: 'Resumen de métricas del día',
    },
    {
      value: 'WEEKLY_REPORT',
      label: 'Reporte Semanal',
      description: 'Reporte completo de la semana',
    },
  ]

  const updateConfig = (updates: Partial<EmailConfig>) => {
    const updated = { ...emailConfig, ...updates }
    setEmailConfig(updated)
    onChange(updated)
  }

  const addEmail = (email: string, type: 'to' | 'cc' | 'bcc') => {
    if (!email.trim()) return

    const { valid, invalid } = validateEmails([email])

    if (invalid.length > 0) {
      setEmailErrors([`Email inválido: ${invalid.join(', ')}`])
      return
    }

    setEmailErrors([])

    switch (type) {
      case 'to':
        updateConfig({ recipients: [...emailConfig.recipients, valid[0]] })
        setNewRecipient('')
        break
      case 'cc':
        updateConfig({ cc: [...(emailConfig.cc || []), valid[0]] })
        setNewCc('')
        break
      case 'bcc':
        updateConfig({ bcc: [...(emailConfig.bcc || []), valid[0]] })
        setNewBcc('')
        break
    }
  }

  const removeEmail = (email: string, type: 'to' | 'cc' | 'bcc') => {
    switch (type) {
      case 'to':
        updateConfig({ recipients: emailConfig.recipients.filter(e => e !== email) })
        break
      case 'cc':
        updateConfig({ cc: emailConfig.cc?.filter(e => e !== email) })
        break
      case 'bcc':
        updateConfig({ bcc: emailConfig.bcc?.filter(e => e !== email) })
        break
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuración de Email
          </CardTitle>
          <CardDescription>
            Configura las notificaciones por email para esta alerta
          </CardDescription>
        </div>
        <Switch
          checked={emailConfig.enabled}
          onCheckedChange={(enabled) => updateConfig({ enabled })}
        />
        </div>
      </CardHeader>

      {emailConfig.enabled && (
        <CardContent className="space-y-6">
          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Destinatarios *</Label>
            <div className="flex gap-2">
              <Input
                id="recipients"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addEmail(newRecipient, 'to')
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addEmail(newRecipient, 'to')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {emailConfig.recipients.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email, 'to')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {emailConfig.recipients.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Agrega al menos un destinatario
              </p>
            )}
          </div>

          {/* CC (optional) */}
          <div className="space-y-2">
            <Label htmlFor="cc">CC (Opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="cc"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newCc}
                onChange={(e) => setNewCc(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addEmail(newCc, 'cc')
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addEmail(newCc, 'cc')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {emailConfig.cc && emailConfig.cc.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {emailConfig.cc.map((email) => (
                  <Badge key={email} variant="outline" className="flex items-center gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email, 'cc')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* BCC (optional) */}
          <div className="space-y-2">
            <Label htmlFor="bcc">BCC (Opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="bcc"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newBcc}
                onChange={(e) => setNewBcc(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addEmail(newBcc, 'bcc')
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addEmail(newBcc, 'bcc')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {emailConfig.bcc && emailConfig.bcc.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {emailConfig.bcc.map((email) => (
                  <Badge key={email} variant="outline" className="flex items-center gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email, 'bcc')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Email errors */}
          {emailErrors.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{emailErrors.join(', ')}</span>
            </div>
          )}

          {/* Template selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Template de Email</Label>
            <Select
              value={emailConfig.template}
              onValueChange={(value) => updateConfig({ template: value as EmailTemplate })}
            >
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto Personalizado (Opcional)</Label>
            <Input
              id="subject"
              placeholder="Dejar vacío para usar asunto por defecto"
              value={emailConfig.customSubject || ''}
              onChange={(e) => updateConfig({ customSubject: e.target.value || undefined })}
            />
          </div>

          {/* Custom message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje Personalizado (Opcional)</Label>
            <Textarea
              id="message"
              placeholder="Dejar vacío para usar mensaje por defecto"
              value={emailConfig.customMessage || ''}
              onChange={(e) => updateConfig({ customMessage: e.target.value || undefined })}
              rows={3}
            />
          </div>

          {/* Additional options */}
          <div className="space-y-3">
            <Label>Opciones Adicionales</Label>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeChart" className="font-normal">
                  Incluir Gráficos
                </Label>
                <p className="text-sm text-muted-foreground">
                  Adjuntar visualizaciones de métricas
                </p>
              </div>
              <Switch
                id="includeChart"
                checked={emailConfig.includeChart || false}
                onCheckedChange={(includeChart) => updateConfig({ includeChart })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeHistorical" className="font-normal">
                  Incluir Datos Históricos
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar tendencia de los últimos 7 días
                </p>
              </div>
              <Switch
                id="includeHistorical"
                checked={emailConfig.includeHistoricalData || false}
                onCheckedChange={(includeHistoricalData) =>
                  updateConfig({ includeHistoricalData })
                }
              />
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Check className="h-4 w-4 text-green-600" />
              Configuración de Email
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Destinatarios:</strong> {formatRecipients(emailConfig.recipients)}
              </p>
              {emailConfig.cc && emailConfig.cc.length > 0 && (
                <p>
                  <strong>CC:</strong> {formatRecipients(emailConfig.cc)}
                </p>
              )}
              {emailConfig.bcc && emailConfig.bcc.length > 0 && (
                <p>
                  <strong>BCC:</strong> {formatRecipients(emailConfig.bcc)}
                </p>
              )}
              <p>
                <strong>Template:</strong>{' '}
                {templates.find((t) => t.value === emailConfig.template)?.label}
              </p>
            </div>
          </div>

          {/* Test button */}
          {onTest && (
            <Button
              type="button"
              variant="outline"
              onClick={onTest}
              className="w-full"
              disabled={emailConfig.recipients.length === 0}
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar Email de Prueba
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}
