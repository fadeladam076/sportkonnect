'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  matchId: string
  isJoined: boolean
  canJoin: boolean
  isFull: boolean
  status: string
  isLoggedIn: boolean
}

export function JoinButton({ matchId, isJoined: initialJoined, canJoin, isFull, status, isLoggedIn }: Props) {
  const router = useRouter()
  const [joined, setJoined] = useState(initialJoined)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const res = await fetch(`/api/matches/${matchId}/join`, {
      method: joined ? 'DELETE' : 'POST',
    })
    setLoading(false)
    if (res.ok) {
      setJoined(!joined)
      router.refresh()
    }
  }

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="w-full flex items-center justify-center bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full py-3 font-inter font-semibold text-sm transition-colors min-h-[48px]">
        Connexion pour rejoindre
      </Link>
    )
  }

  if (status === 'COMPLETED') {
    return <div className="text-center font-inter text-sm text-[#9CA3AF]">Match terminé</div>
  }

  if (status === 'CLOSED') {
    return <div className="text-center font-inter text-sm text-[#9CA3AF]">Match fermé</div>
  }

  if (joined) {
    return (
      <button onClick={toggle} disabled={loading}
        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full py-3 font-inter font-semibold text-sm transition-colors min-h-[48px] disabled:opacity-50"
      >
        {loading ? '...' : 'Se désinscrire'}
      </button>
    )
  }

  if (isFull) {
    return (
      <div className="w-full text-center bg-white/5 text-[#9CA3AF] rounded-full py-3 font-inter text-sm">
        Match complet
      </div>
    )
  }

  return (
    <button onClick={toggle} disabled={!canJoin || loading}
      className="w-full bg-[#0B8F3C] hover:bg-[#22C55E] disabled:opacity-50 text-white rounded-full py-3 font-inter font-semibold text-sm transition-colors min-h-[48px]"
    >
      {loading ? 'Inscription...' : 'Rejoindre ce match'}
    </button>
  )
}
