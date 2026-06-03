'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { PlayerStat } from '@prisma/client'

interface Props {
  stats: PlayerStat | null
}

export function PlayerRadarChart({ stats }: Props) {
  const data = [
    { subject: 'Vitesse',    value: stats?.speed     ?? 0 },
    { subject: 'Technique',  value: stats?.technique ?? 0 },
    { subject: 'Physique',   value: stats?.physical  ?? 0 },
    { subject: 'Mental',     value: stats?.mental    ?? 0 },
    { subject: 'Vision',     value: stats?.vision    ?? 0 },
    { subject: 'Tir',        value: stats?.shooting  ?? 0 },
  ]

  const hasData = data.some((d) => d.value > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-56">
        <p className="font-inter text-[#9CA3AF] text-sm text-center">
          Les statistiques physiques seront<br />affichées ici après évaluation.
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid stroke="#1F2937" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'var(--font-inter)' }}
        />
        <Radar
          dataKey="value"
          stroke="#22C55E"
          fill="#0B8F3C"
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #1F2937',
            borderRadius: 8,
            fontFamily: 'var(--font-inter)',
            fontSize: 12,
            color: '#fff',
          }}
          formatter={(v) => [v !== undefined ? `${v}/100` : '—', '']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
