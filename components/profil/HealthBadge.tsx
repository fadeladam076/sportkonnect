import type { Health } from '@prisma/client'

const CONFIG: Record<Health, { label: string; color: string; dot: string }> = {
  FIT:        { label: 'Disponible',      color: 'bg-green-500/10 text-green-400 border-green-500/30',   dot: 'bg-green-400' },
  INJURED:    { label: 'Blessé',          color: 'bg-red-500/10 text-red-400 border-red-500/30',         dot: 'bg-red-400' },
  SUSPENDED:  { label: 'Suspendu',        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
  RECOVERING: { label: 'En récupération', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
}

export function HealthBadge({ status }: { status: Health }) {
  const { label, color, dot } = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-inter font-medium border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
