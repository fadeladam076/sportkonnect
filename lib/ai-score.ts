import type { PlayerStat } from '@prisma/client'

const WEIGHTS: Record<string, Record<string, number>> = {
  attaquant: { goals: 0.30, assists: 0.15, shooting: 0.20, speed: 0.15, technique: 0.10, physical: 0.10 },
  milieu:    { assists: 0.25, vision: 0.25, technique: 0.20, mental: 0.15, goals: 0.10, physical: 0.05 },
  defenseur: { physical: 0.30, mental: 0.25, technique: 0.20, vision: 0.15, speed: 0.10 },
  gardien:   { mental: 0.35, physical: 0.25, technique: 0.25, vision: 0.15 },
}

export function calculateSPG(stats: PlayerStat, position: string): number {
  const w = WEIGHTS[position.toLowerCase()] ?? WEIGHTS.milieu
  const participation = stats.matchesPlayed > 0 ? stats.wins / stats.matchesPlayed : 0
  const goalsPerMatch = stats.matchesPlayed > 0 ? Math.min(stats.goals / stats.matchesPlayed, 1) : 0
  const assistsPerMatch = stats.matchesPlayed > 0 ? Math.min(stats.assists / stats.matchesPlayed, 1) : 0

  const score =
    (goalsPerMatch    * (w.goals     ?? 0) * 100) +
    (assistsPerMatch  * (w.assists   ?? 0) * 100) +
    ((stats.shooting  ?? 50) * (w.shooting  ?? 0)) +
    ((stats.speed     ?? 50) * (w.speed     ?? 0)) +
    ((stats.technique ?? 50) * (w.technique ?? 0)) +
    ((stats.physical  ?? 50) * (w.physical  ?? 0)) +
    ((stats.mental    ?? 50) * (w.mental    ?? 0)) +
    ((stats.vision    ?? 50) * (w.vision    ?? 0)) +
    (participation * 10)

  return Math.min(Math.round(score), 100)
}
