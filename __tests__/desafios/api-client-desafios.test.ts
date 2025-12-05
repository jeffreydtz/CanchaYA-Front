import { describe, it, expect, jest, beforeEach } from '@jest/globals'

/**
 * Tests for Desafíos API Client methods
 *
 * These tests verify that API client methods construct correct requests
 * and handle responses appropriately.
 */

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock

// Mock getCookie function
jest.mock('@/lib/auth', () => ({
  getCookie: jest.fn(() => 'mock-token')
}))

import apiClient from '@/lib/api-client'

describe('API Client - Desafíos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('getDesafios', () => {
    it('should fetch desafíos without filters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => []
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.getDesafios()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          })
        })
      )
    })

    it('should fetch desafíos with estado filter', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => []
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.getDesafios({ estado: 'pendiente' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('estado=pendiente'),
        expect.any(Object)
      )
    })

    it('should fetch desafíos with multiple filters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => []
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.getDesafios({
        estado: 'aceptado',
        deporteId: 'deporte-123'
      })

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(callUrl).toContain('estado=aceptado')
      expect(callUrl).toContain('deporteId=deporte-123')
    })
  })

  describe('createDesafio', () => {
    it('should create desafío with correct payload', async () => {
      const mockDesafio = {
        reservaId: 'reserva-123',
        deporteId: 'deporte-456',
        invitadosDesafiadosIds: ['persona-1', 'persona-2'],
        jugadoresCreadorIds: ['persona-3']
      }

      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({ id: 'desafio-789', ...mockDesafio })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.createDesafio(mockDesafio)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockDesafio),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })

  describe('aceptarDesafio', () => {
    it('should accept desafío', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: 'desafio-123', estado: 'aceptado' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.aceptarDesafio('desafio-123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios/desafio-123/aceptar'),
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })
  })

  describe('rechazarDesafio', () => {
    it('should reject desafío', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: 'desafio-123', estado: 'pendiente' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.rechazarDesafio('desafio-123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios/desafio-123/rechazar'),
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })
  })

  describe('cancelarDesafio', () => {
    it('should cancel desafío', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: 'desafio-123', estado: 'cancelado' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.cancelarDesafio('desafio-123')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios/desafio-123/cancelar'),
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })
  })

  describe('finalizarDesafio', () => {
    it('should finalize desafío with complete data', async () => {
      const finalizarData = {
        ganadorLado: 'creador' as const,
        resultado: '7-5',
        valoracion: 4
      }

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: 'desafio-123', estado: 'finalizado', ...finalizarData })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.finalizarDesafio('desafio-123', finalizarData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios/desafio-123/finalizar'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(finalizarData)
        })
      )
    })

    it('should finalize desafío with minimal data', async () => {
      const finalizarData = {
        ganadorLado: 'desafiado' as const
      }

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: 'desafio-123', estado: 'finalizado' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.finalizarDesafio('desafio-123', finalizarData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios/desafio-123/finalizar'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(finalizarData)
        })
      )
    })
  })

  describe('agregarJugadoresDesafio', () => {
    it('should invite players to team', async () => {
      const jugadoresData = {
        lado: 'creador' as const,
        accion: 'invitar' as const,
        jugadoresIds: ['persona-1', 'persona-2']
      }

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: 'desafio-123' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.agregarJugadoresDesafio('desafio-123', jugadoresData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios/desafio-123/agregar-jugadores'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(jugadoresData)
        })
      )
    })

    it('should remove players from team', async () => {
      const jugadoresData = {
        lado: 'desafiado' as const,
        accion: 'remover' as const,
        jugadoresIds: ['persona-3']
      }

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: 'desafio-123' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await apiClient.agregarJugadoresDesafio('desafio-123', jugadoresData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/desafios/desafio-123/agregar-jugadores'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(jugadoresData)
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should handle 404 error', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({ message: 'Desafío no encontrado' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiClient.getDesafio('invalid-id')

      expect(result.error).toBeDefined()
      expect(result.status).toBe(404)
    })

    it('should handle 400 validation error', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({ message: 'Datos inválidos' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiClient.createDesafio({
        reservaId: '',
        deporteId: '',
        invitadosDesafiadosIds: []
      })

      expect(result.error).toBeDefined()
      expect(result.status).toBe(400)
    })

    it('should handle network error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await apiClient.getDesafios()

      expect(result.error).toBeDefined()
      expect(result.status).toBe(0)
    })
  })
})
