'use client'

import { useCallback, useEffect, useState } from 'react'

interface PlayerProfile {
  id: string
  firstName: string
  lastName: string
  positionMain: string
  positionsOther: string[]
  city: string
  nationality: string
  aiScore: number | null
  photoUrl: string | null
  healthStatus: string
}

export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayer = useCallback(async () => {
    if (!playerId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/players/${playerId}`)
      if (!res.ok) throw new Error('Joueur introuvable')
      setPlayer(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [playerId])

  useEffect(() => {
    fetchPlayer()
  }, [fetchPlayer])

  return { player, loading, error, refetch: fetchPlayer }
}
