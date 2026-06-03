import Image from 'next/image'
import type { Player, PlayerStat } from '@prisma/client'
import { HealthBadge } from './HealthBadge'

interface Props {
  player: Player & { stats: PlayerStat[] }
  isOwner: boolean
  editHref: string
}

const POSITION_LABELS: Record<string, string> = {
  gardien:   'Gardien',
  defenseur: 'Défenseur',
  milieu:    'Milieu',
  attaquant: 'Attaquant',
}

export function PlayerCard({ player, isOwner, editHref }: Props) {
  const age = player.dob
    ? Math.floor((Date.now() - new Date(player.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  const posLabel = POSITION_LABELS[player.positionMain?.toLowerCase()] ?? player.positionMain

  return (
    <div className="bg-[#111827] rounded-2xl shadow-lg shadow-black/20 p-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          {player.photoUrl ? (
            <Image
              src={player.photoUrl}
              alt={`${player.firstName} ${player.lastName}`}
              width={88}
              height={88}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#0B8F3C]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#0F172A] border-2 border-[#0B8F3C] flex items-center justify-center">
              <span className="font-poppins text-2xl font-bold text-[#22C55E]">
                {player.firstName?.[0]}{player.lastName?.[0]}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h1 className="font-poppins text-2xl font-bold text-white leading-tight">
                {player.firstName} {player.lastName.toUpperCase()}
              </h1>
              {posLabel && (
                <span className="inline-block mt-1 bg-[#0B8F3C]/20 text-[#22C55E] border border-[#0B8F3C]/30 rounded-full px-3 py-0.5 text-xs font-inter font-medium">
                  {posLabel}
                </span>
              )}
            </div>

            {/* SPG Score */}
            {player.aiScore !== null && (
              <div className="text-right">
                <div className="font-poppins text-4xl font-bold text-[#22C55E] leading-none">
                  {player.aiScore}
                </div>
                <div className="font-inter text-xs text-[#9CA3AF]">SPG / 100</div>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-inter text-[#9CA3AF]">
            {player.nationality && <span>{player.nationality}</span>}
            {player.city && <span>· {player.city}</span>}
            {age && <span>· {age} ans</span>}
            {player.height && <span>· {player.height} cm</span>}
            {player.foot && <span>· Pied {player.foot}</span>}
          </div>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <HealthBadge status={player.healthStatus} />
            {isOwner && (
              <a
                href={editHref}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-inter font-medium border border-white/10 text-[#9CA3AF] hover:border-[#0B8F3C] hover:text-white transition-colors"
              >
                ✏️ Modifier le profil
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
