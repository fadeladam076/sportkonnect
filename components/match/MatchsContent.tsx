'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { MatchCard, type MatchItem } from '@/components/match/MatchCard'

interface Props {
  matches: MatchItem[]
  city: string
  level: string
}

const LEVEL_KEYS = [
  { value: '',              key: 'all' },
  { value: 'debutant',     key: 'beginner' },
  { value: 'intermediaire',key: 'intermediate' },
  { value: 'avance',       key: 'advanced' },
  { value: 'pro',          key: 'pro' },
]

export function MatchsContent({ matches, city, level }: Props) {
  const { t } = useTranslation('common')

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins text-2xl font-bold text-white">
          {t('matchs.title', 'Matchs disponibles')}
        </h1>
        <Link
          href="/matchs/nouveau"
          className="bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-5 py-2 font-inter text-sm font-semibold transition-colors"
        >
          {t('matchs.create', '+ Créer')}
        </Link>
      </div>

      {/* Filtres */}
      <form method="GET" className="flex flex-wrap gap-2 mb-6">
        <input
          name="city"
          defaultValue={city}
          placeholder={t('matchs.filter_placeholder', 'Ville...')}
          className="bg-[#111827] border border-white/10 rounded-full px-4 py-2 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors min-w-[140px]"
        />
        <select
          name="level"
          defaultValue={level}
          className="bg-[#111827] border border-white/10 rounded-full px-4 py-2 text-white font-inter text-sm focus:outline-none focus:border-[#0B8F3C] transition-colors"
        >
          {LEVEL_KEYS.map((l) => (
            <option key={l.value} value={l.value}>
              {t(`matchs.levels.${l.key}`, l.key)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-[#0B8F3C]/20 hover:bg-[#0B8F3C]/40 text-[#22C55E] border border-[#0B8F3C]/30 rounded-full px-4 py-2 font-inter text-sm transition-colors"
        >
          {t('matchs.filter_btn', 'Filtrer')}
        </button>
        {(city || level) && (
          <Link
            href="/matchs"
            className="text-[#9CA3AF] hover:text-white font-inter text-sm py-2 px-2 transition-colors"
          >
            ✕ {t('matchs.reset', 'Réinitialiser')}
          </Link>
        )}
      </form>

      {/* Liste */}
      {matches.length === 0 ? (
        <div className="bg-[#111827] rounded-xl p-12 text-center">
          <p className="font-poppins text-white font-semibold mb-2">
            {t('matchs.empty_title', 'Aucun match trouvé')}
          </p>
          <p className="font-inter text-sm text-[#9CA3AF] mb-6">
            {t('matchs.empty_desc', 'Sois le premier à organiser un match dans ta ville !')}
          </p>
          <Link
            href="/matchs/nouveau"
            className="inline-flex items-center bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-6 py-3 font-inter font-semibold text-sm transition-colors"
          >
            {t('matchs.create_match', 'Créer un match')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </main>
  )
}
