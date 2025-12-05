import { describe, it, expect } from '@jest/globals'

/**
 * Utility functions for Desafíos module
 */

// Helper to determine user role in a desafío
export function getUserRole(
  desafio: any,
  personaId: string
): 'creador' | 'jugador_creador' | 'jugador_desafiado' | 'invitado_creador' | 'invitado_desafiado' | 'ninguno' {
  if (desafio.creador.id === personaId) return 'creador'

  if (desafio.jugadoresCreador.some((j: any) => j.id === personaId)) {
    return 'jugador_creador'
  }

  if (desafio.jugadoresDesafiados.some((j: any) => j.id === personaId)) {
    return 'jugador_desafiado'
  }

  if (desafio.invitadosCreador.some((i: any) => i.id === personaId)) {
    return 'invitado_creador'
  }

  if (desafio.invitadosDesafiados.some((i: any) => i.id === personaId)) {
    return 'invitado_desafiado'
  }

  return 'ninguno'
}

// Helper to check if user can cancel desafío
export function canCancelDesafio(
  desafio: any,
  personaId: string,
  userRole: 'admin' | 'usuario'
): boolean {
  if (userRole === 'admin') return true
  if (desafio.estado === 'finalizado' || desafio.estado === 'cancelado') return false
  return desafio.creador.id === personaId
}

// Helper to check if user can finalize desafío
export function canFinalizeDesafio(
  desafio: any,
  personaId: string,
  currentDate: Date = new Date()
): boolean {
  if (desafio.estado !== 'aceptado') return false

  const reservaDate = new Date(desafio.reserva.fechaHora)
  if (reservaDate > currentDate) return false

  const isParticipant =
    desafio.jugadoresCreador.some((j: any) => j.id === personaId) ||
    desafio.jugadoresDesafiados.some((j: any) => j.id === personaId)

  return isParticipant
}

// Helper to format match result
export function formatResult(golesCreador: number | null, golesDesafiado: number | null): string {
  if (golesCreador === null || golesDesafiado === null) return '-'
  return `${golesCreador} - ${golesDesafiado}`
}

// Helper to get winner text
export function getWinnerText(ganador: 'creador' | 'desafiado' | null): string {
  if (!ganador) return 'Por definir'
  return ganador === 'creador' ? 'Equipo Creador' : 'Equipo Desafiado'
}

describe('Desafío Utils', () => {
  const mockDesafio = {
    id: '123',
    estado: 'aceptado',
    creador: { id: 'persona-1', nombre: 'Juan', apellido: 'Pérez' },
    jugadoresCreador: [{ id: 'persona-2', nombre: 'Pedro', apellido: 'Gómez' }],
    jugadoresDesafiados: [{ id: 'persona-3', nombre: 'Luis', apellido: 'Martínez' }],
    invitadosCreador: [{ id: 'persona-4', nombre: 'Carlos', apellido: 'López' }],
    invitadosDesafiados: [{ id: 'persona-5', nombre: 'Ana', apellido: 'Silva' }],
    reserva: {
      fechaHora: '2025-12-10T15:00:00.000Z'
    },
    ganador: null,
    golesCreador: null,
    golesDesafiado: null
  }

  describe('getUserRole', () => {
    it('should identify creator', () => {
      expect(getUserRole(mockDesafio, 'persona-1')).toBe('creador')
    })

    it('should identify jugador creador', () => {
      expect(getUserRole(mockDesafio, 'persona-2')).toBe('jugador_creador')
    })

    it('should identify jugador desafiado', () => {
      expect(getUserRole(mockDesafio, 'persona-3')).toBe('jugador_desafiado')
    })

    it('should identify invitado creador', () => {
      expect(getUserRole(mockDesafio, 'persona-4')).toBe('invitado_creador')
    })

    it('should identify invitado desafiado', () => {
      expect(getUserRole(mockDesafio, 'persona-5')).toBe('invitado_desafiado')
    })

    it('should return ninguno for non-participant', () => {
      expect(getUserRole(mockDesafio, 'persona-999')).toBe('ninguno')
    })
  })

  describe('canCancelDesafio', () => {
    it('should allow admin to cancel any desafío', () => {
      expect(canCancelDesafio(mockDesafio, 'any-persona', 'admin')).toBe(true)
    })

    it('should allow creator to cancel their desafío', () => {
      expect(canCancelDesafio(mockDesafio, 'persona-1', 'usuario')).toBe(true)
    })

    it('should not allow non-creator to cancel desafío', () => {
      expect(canCancelDesafio(mockDesafio, 'persona-2', 'usuario')).toBe(false)
    })

    it('should not allow canceling finalizado desafío', () => {
      const finalizadoDesafio = { ...mockDesafio, estado: 'finalizado' }
      expect(canCancelDesafio(finalizadoDesafio, 'persona-1', 'usuario')).toBe(false)
    })

    it('should not allow canceling cancelado desafío', () => {
      const canceladoDesafio = { ...mockDesafio, estado: 'cancelado' }
      expect(canCancelDesafio(canceladoDesafio, 'persona-1', 'usuario')).toBe(false)
    })
  })

  describe('canFinalizeDesafio', () => {
    it('should allow participant to finalize after match date', () => {
      const pastDate = new Date('2025-12-11T00:00:00.000Z')
      expect(canFinalizeDesafio(mockDesafio, 'persona-2', pastDate)).toBe(true)
      expect(canFinalizeDesafio(mockDesafio, 'persona-3', pastDate)).toBe(true)
    })

    it('should not allow finalization before match date', () => {
      const futureDate = new Date('2025-12-09T00:00:00.000Z')
      expect(canFinalizeDesafio(mockDesafio, 'persona-2', futureDate)).toBe(false)
    })

    it('should not allow non-participant to finalize', () => {
      const pastDate = new Date('2025-12-11T00:00:00.000Z')
      expect(canFinalizeDesafio(mockDesafio, 'persona-999', pastDate)).toBe(false)
    })

    it('should not allow finalization if not aceptado', () => {
      const pendienteDesafio = { ...mockDesafio, estado: 'pendiente' }
      const pastDate = new Date('2025-12-11T00:00:00.000Z')
      expect(canFinalizeDesafio(pendienteDesafio, 'persona-2', pastDate)).toBe(false)
    })
  })

  describe('formatResult', () => {
    it('should format valid result', () => {
      expect(formatResult(7, 5)).toBe('7 - 5')
      expect(formatResult(0, 0)).toBe('0 - 0')
    })

    it('should return dash for null values', () => {
      expect(formatResult(null, null)).toBe('-')
      expect(formatResult(7, null)).toBe('-')
      expect(formatResult(null, 5)).toBe('-')
    })
  })

  describe('getWinnerText', () => {
    it('should return correct winner text', () => {
      expect(getWinnerText('creador')).toBe('Equipo Creador')
      expect(getWinnerText('desafiado')).toBe('Equipo Desafiado')
    })

    it('should return placeholder for null winner', () => {
      expect(getWinnerText(null)).toBe('Por definir')
    })
  })
})
