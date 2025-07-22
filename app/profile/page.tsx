/**
 * Profile Page for CanchaYA
 *
 * Requirements:
 * - Fetch and display the current user's personal info (/personas/:id)
 * - Fetch and display the user's competitive profile (/perfil-competitivo/:id)
 * - Allow editing of both personal info and competitive profile
 * - Use updated backend endpoints and data models
 * - Follow KISS, DRY, and Documentation First principles
 * - Use accessible, user-friendly UI (reuse UI components where possible)
 *
 * Last updated: 2024-06-10
 */

'use client'

import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { getClientUser } from '@/lib/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

interface Persona {
  id: string
  nombre: string
  apellido?: string
  email: string
  telefono?: string
}

interface PerfilCompetitivo {
  id: string
  usuarioId: string
  victorias: number
  derrotas: number
  puntos: number
  ranking: number
}

export default function ProfilePage() {
  const [persona, setPersona] = useState<Persona | null>(null)
  const [perfil, setPerfil] = useState<PerfilCompetitivo | null>(null)
  const [loading, setLoading] = useState(true)
  const [editPersona, setEditPersona] = useState(false)
  const [editPerfil, setEditPerfil] = useState(false)
  const [formPersona, setFormPersona] = useState<Partial<Persona>>({})
  const [formPerfil, setFormPerfil] = useState<Partial<PerfilCompetitivo>>({})

  // Get current user from auth context or cookie
  const user = getClientUser()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      apiClient.apiRequest<Persona>(`/personas/${user.id}`),
      apiClient.apiRequest<PerfilCompetitivo>(`/perfil-competitivo/${user.id}`),
    ]).then(([personaRes, perfilRes]) => {
      if (personaRes.data) setPersona(personaRes.data)
      if (perfilRes.data) setPerfil(perfilRes.data)
      setLoading(false)
    })
  }, [user])

  // Handlers for editing personal info
  const handlePersonaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormPersona({ ...formPersona, [e.target.name]: e.target.value })
  }
  const handlePersonaSave = async () => {
    if (!persona) return
    const res = await apiClient.apiRequest<Persona>(`/personas/${persona.id}`, {
      method: 'PUT',
      body: JSON.stringify(formPersona),
    })
    if (res.data) {
      setPersona(res.data)
      setEditPersona(false)
      toast({ title: 'Datos personales actualizados' })
    } else {
      toast({ title: 'Error al actualizar', description: res.error, variant: 'destructive' })
    }
  }

  // Handlers for editing competitive profile
  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormPerfil({ ...formPerfil, [e.target.name]: e.target.value })
  }
  const handlePerfilSave = async () => {
    if (!perfil) return
    const res = await apiClient.apiRequest<PerfilCompetitivo>(`/perfil-competitivo/${perfil.id}`, {
      method: 'PUT',
      body: JSON.stringify(formPerfil),
    })
    if (res.data) {
      setPerfil(res.data)
      setEditPerfil(false)
      toast({ title: 'Perfil competitivo actualizado' })
    } else {
      toast({ title: 'Error al actualizar', description: res.error, variant: 'destructive' })
    }
  }

  if (loading) return <div>Cargando perfil...</div>
  if (!persona) return <div>No se encontró información personal.</div>

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Datos Personales</h2>
        {editPersona ? (
          <div className="space-y-2">
            <Input name="nombre" value={formPersona.nombre ?? persona.nombre} onChange={handlePersonaChange} placeholder="Nombre" />
            <Input name="apellido" value={formPersona.apellido ?? persona.apellido ?? ''} onChange={handlePersonaChange} placeholder="Apellido" />
            <Input name="email" value={formPersona.email ?? persona.email} onChange={handlePersonaChange} placeholder="Email" />
            <Input name="telefono" value={formPersona.telefono ?? persona.telefono ?? ''} onChange={handlePersonaChange} placeholder="Teléfono" />
            <div className="flex gap-2 mt-2">
              <Button onClick={handlePersonaSave}>Guardar</Button>
              <Button variant="secondary" onClick={() => setEditPersona(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div><b>Nombre:</b> {persona.nombre}</div>
            <div><b>Apellido:</b> {persona.apellido ?? '-'}</div>
            <div><b>Email:</b> {persona.email}</div>
            <div><b>Teléfono:</b> {persona.telefono ?? '-'}</div>
            <Button className="mt-2" onClick={() => { setEditPersona(true); setFormPersona(persona) }}>Editar</Button>
          </div>
        )}
      </Card>

      {perfil && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Perfil Competitivo</h2>
          {editPerfil ? (
            <div className="space-y-2">
              <Input name="victorias" type="number" value={formPerfil.victorias ?? perfil.victorias} onChange={handlePerfilChange} placeholder="Victorias" />
              <Input name="derrotas" type="number" value={formPerfil.derrotas ?? perfil.derrotas} onChange={handlePerfilChange} placeholder="Derrotas" />
              <Input name="puntos" type="number" value={formPerfil.puntos ?? perfil.puntos} onChange={handlePerfilChange} placeholder="Puntos" />
              <Input name="ranking" type="number" value={formPerfil.ranking ?? perfil.ranking} onChange={handlePerfilChange} placeholder="Ranking" />
              <div className="flex gap-2 mt-2">
                <Button onClick={handlePerfilSave}>Guardar</Button>
                <Button variant="secondary" onClick={() => setEditPerfil(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div><b>Victorias:</b> {perfil.victorias}</div>
              <div><b>Derrotas:</b> {perfil.derrotas}</div>
              <div><b>Puntos:</b> {perfil.puntos}</div>
              <div><b>Ranking:</b> {perfil.ranking}</div>
              <Button className="mt-2" onClick={() => { setEditPerfil(true); setFormPerfil(perfil) }}>Editar</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
} 