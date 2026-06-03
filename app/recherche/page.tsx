'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'

interface PlayerResult {
  id: string
  firstName: string
  lastName: string
  positionMain: string
  city: string
  nationality: string
  photoUrl: string | null
  aiScore: number | null
  healthStatus: string
}

const POSITIONS = [
  { value: '',          key: 'all' },
  { value: 'gardien',   key: 'goalkeeper' },
  { value: 'defenseur', key: 'defender' },
  { value: 'milieu',    key: 'midfielder' },
  { value: 'attaquant', key: 'forward' },
]

export default function RecherchePage() {
  const { t } = useTranslation('common')
  const [q, setQ]               = useState('')
  const [position, setPosition] = useState('')
  const [city, setCity]         = useState('')
  const [players, setPlayers]   = useState<PlayerResult[]>([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setSearched(true)
    const params = new URLSearchParams()
    if (q)        params.set('q', q)
    if (position) params.set('position', position)
    if (city)     params.set('city', city)
    const res = await fetch(`/api/search?${params}`)
    const data = await res.json()
    setPlayers(data)
    setLoading(false)
  }, [q, position, city])

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="font-poppins text-2xl font-bold text-white mb-6">{t('recherche.title', 'Recherche de joueurs')}</h1>

        {/* Formulaire de recherche */}
        <form onSubmit={search} className="bg-[#111827] rounded-xl p-5 shadow-lg shadow-black/20 mb-6 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('recherche.name_placeholder', 'Nom, nationalité...')}
              className="flex-1 min-w-[160px] bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors"
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('recherche.city_placeholder', 'Ville')}
              className="w-36 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {POSITIONS.map((p) => (
              <button
                key={p.value} type="button"
                onClick={() => setPosition(p.value)}
                className={`px-4 py-2 rounded-full font-inter text-sm transition-colors border ${
                  position === p.value
                    ? 'bg-[#0B8F3C]/20 border-[#0B8F3C] text-[#22C55E]'
                    : 'border-white/10 text-[#9CA3AF] hover:border-white/30 hover:text-white'
                }`}
              >
                {t(`recherche.positions.${p.key}`, p.key)}
              </button>
            ))}
          </div>

          <button type="submit"
            className="w-full bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full py-3 font-inter font-semibold text-sm transition-colors"
          >
            {t('recherche.search_btn', 'Rechercher')}
          </button>
        </form>

        {/* Résultats */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#0B8F3C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && players.length === 0 && (
          <div className="bg-[#111827] rounded-xl p-10 text-center">
            <p className="font-inter text-[#9CA3AF] text-sm">{t('recherche.no_results', 'Aucun joueur trouvé avec ces critères.')}</p>
          </div>
        )}

        {!loading && players.length > 0 && (
          <div className="space-y-3">
            <p className="font-inter text-xs text-[#9CA3AF]">{t('recherche.results_count_other', { count: players.length, defaultValue: `${players.length} joueurs trouvés` })}</p>
            {players.map((player) => (
              <Link key={player.id} href={`/profil/${player.id}`} className="block group">
                <div className="bg-[#111827] border border-white/5 group-hover:border-[#0B8F3C]/40 rounded-xl p-4 flex items-center gap-4 transition-all">
                  {player.photoUrl ? (
                    <Image src={player.photoUrl} alt={player.firstName} width={48} height={48} className="w-12 h-12 rounded-full object-cover border border-[#0B8F3C]/30 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#0B8F3C] flex items-center justify-center font-poppins font-bold text-white shrink-0">
                      {player.firstName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-poppins font-semibold text-white group-hover:text-[#22C55E] transition-colors">
                      {player.firstName} {player.lastName}
                    </div>
                    <div className="font-inter text-sm text-[#9CA3AF] capitalize">
                      {player.positionMain}{player.city ? ` · ${player.city}` : ''}{player.nationality ? ` · ${player.nationality}` : ''}
                    </div>
                  </div>
                  {player.aiScore !== null && (
                    <div className="text-right shrink-0">
                      <div className="font-poppins text-xl font-bold text-[#22C55E]">{player.aiScore}</div>
                      <div className="font-inter text-xs text-[#9CA3AF]">SPG</div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {!searched && (
          <div className="text-center py-12">
            <p className="font-inter text-[#9CA3AF] text-sm">{t('recherche.start_search', 'Lance une recherche pour trouver des joueurs.')}</p>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
