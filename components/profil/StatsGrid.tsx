import type { PlayerStat } from '@prisma/client'

interface Props {
  stats: PlayerStat | null
}

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-[#0F172A] rounded-xl p-4 text-center">
      <div className="font-poppins text-2xl font-bold text-[#22C55E]">{value}</div>
      <div className="font-inter text-xs text-[#9CA3AF] mt-1">{label}</div>
    </div>
  )
}

export function StatsGrid({ stats }: Props) {
  if (!stats) {
    return (
      <div className="bg-[#111827] rounded-xl p-6 text-center">
        <p className="font-inter text-[#9CA3AF] text-sm">Aucune statistique disponible.</p>
      </div>
    )
  }

  const winRate =
    stats.matchesPlayed > 0
      ? Math.round((stats.wins / stats.matchesPlayed) * 100)
      : 0

  return (
    <div>
      <h3 className="font-poppins font-semibold text-white mb-3">
        Saison {stats.season}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatBox value={stats.goals}         label="Buts" />
        <StatBox value={stats.assists}       label="Passes décisives" />
        <StatBox value={stats.matchesPlayed} label="Matchs" />
        <StatBox value={stats.minutesPlayed} label="Minutes" />
        <StatBox value={`${winRate}%`}       label="% Victoires" />
        <StatBox value={stats.yellowCards}   label="Cartons jaunes" />
      </div>
    </div>
  )
}
