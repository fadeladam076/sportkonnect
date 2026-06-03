import Link from 'next/link'

export interface MatchItem {
  id: string
  title: string
  city: string
  address: string
  date: string
  level: string
  maxPlayers: number
  status: string
  ageMin: number | null
  ageMax: number | null
  _count: { participants: number }
  club: { name: string; logoUrl: string | null } | null
}

const LEVEL_STYLES: Record<string, string> = {
  debutant:      'bg-blue-500/10 text-blue-400 border-blue-500/30',
  intermediaire: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  avance:        'bg-orange-500/10 text-orange-400 border-orange-500/30',
  pro:           'bg-purple-500/10 text-purple-400 border-purple-500/30',
}
const LEVEL_LABELS: Record<string, string> = {
  debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé', pro: 'Pro',
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function MatchCard({ match }: { match: MatchItem }) {
  const spots = match.maxPlayers - match._count.participants
  const isFull = spots <= 0 || match.status !== 'OPEN'
  const levelStyle = LEVEL_STYLES[match.level] ?? 'bg-white/5 text-[#9CA3AF] border-white/10'
  const levelLabel = LEVEL_LABELS[match.level] ?? match.level

  return (
    <Link href={`/matchs/${match.id}`} className="block group">
      <div className="bg-[#111827] border border-white/5 group-hover:border-[#0B8F3C]/40 rounded-xl p-5 shadow-lg shadow-black/20 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-poppins font-semibold text-white group-hover:text-[#22C55E] transition-colors truncate">
              {match.title}
            </h3>
            {match.club && (
              <p className="font-inter text-xs text-[#9CA3AF] mt-0.5">{match.club.name}</p>
            )}
          </div>
          <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-inter font-medium border ${levelStyle}`}>
            {levelLabel}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 font-inter text-sm text-[#9CA3AF]">
            <span className="text-base">📅</span>
            <span className="capitalize">{formatDate(match.date)}</span>
          </div>
          <div className="flex items-center gap-2 font-inter text-sm text-[#9CA3AF]">
            <span className="text-base">📍</span>
            <span className="truncate">{match.city}{match.address ? ` — ${match.address}` : ''}</span>
          </div>
          {(match.ageMin || match.ageMax) && (
            <div className="flex items-center gap-2 font-inter text-sm text-[#9CA3AF]">
              <span className="text-base">👤</span>
              <span>
                {match.ageMin && match.ageMax
                  ? `${match.ageMin}–${match.ageMax} ans`
                  : match.ageMin ? `${match.ageMin}+ ans` : `–${match.ageMax} ans`}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* Jauge joueurs */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {Array.from({ length: Math.min(match._count.participants, 4) }).map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-[#0B8F3C] border border-[#111827]" />
              ))}
            </div>
            <span className="font-inter text-xs text-[#9CA3AF]">
              {match._count.participants}/{match.maxPlayers} joueurs
            </span>
          </div>

          {isFull ? (
            <span className="font-inter text-xs text-[#9CA3AF] border border-white/10 rounded-full px-3 py-1">
              {match.status === 'FULL' ? 'Complet' : match.status === 'CLOSED' ? 'Fermé' : 'Terminé'}
            </span>
          ) : (
            <span className="font-inter text-xs text-[#22C55E] border border-[#0B8F3C]/40 rounded-full px-3 py-1 group-hover:bg-[#0B8F3C]/20 transition-colors">
              {spots} place{spots > 1 ? 's' : ''} dispo →
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
