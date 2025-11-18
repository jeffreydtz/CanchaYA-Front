'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [meResponse, setMeResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAuthMe = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getMe()
      console.log('Full response:', response)
      setMeResponse(response)

      if (!response.data) {
        setError('No data returned from /auth/me')
        return
      }

      const { personaId, id, email } = response.data

      // Validate UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const isValidUUID = personaId && uuidRegex.test(personaId)

      console.log('PersonaID Validation:', {
        personaId,
        isValidUUID,
        type: typeof personaId,
        length: personaId ? personaId.length : null
      })
    } catch (err: any) {
      setError(err.message || 'Error fetching /auth/me')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Debug Page</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test /auth/me endpoint and personaId validation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Auth Me Endpoint Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={fetchAuthMe}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Fetch /auth/me'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm font-mono">
                  ❌ {error}
                </p>
              </div>
            )}

            {meResponse && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Full Response:</h3>
                  <pre className="text-xs overflow-auto text-gray-700 dark:text-gray-300 max-h-96">
                    {JSON.stringify(meResponse, null, 2)}
                  </pre>
                </div>

                {meResponse.data && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Data Extracted:</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {meResponse.data.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">PersonaID:</span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {meResponse.data.personaId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {meResponse.data.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Role:</span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {meResponse.data.rol}
                        </span>
                      </div>

                      {/* UUID Validation */}
                      {meResponse.data.personaId && (
                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600 dark:text-gray-400">PersonaID Type:</span>
                            <span className="font-mono text-gray-900 dark:text-white">
                              {typeof meResponse.data.personaId}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600 dark:text-gray-400">PersonaID Length:</span>
                            <span className="font-mono text-gray-900 dark:text-white">
                              {meResponse.data.personaId.length} chars
                            </span>
                          </div>

                          {(() => {
                            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                            const isValid = uuidRegex.test(meResponse.data.personaId)
                            return (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Valid UUID:</span>
                                <span className={`font-mono font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                                  {isValid ? '✓ YES' : '✗ NO'}
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>1. Make sure you're logged in before testing</p>
            <p>2. Click "Fetch /auth/me" to test the endpoint</p>
            <p>3. Check if personaId is a valid UUID</p>
            <p>4. If not valid, the backend needs to be fixed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
