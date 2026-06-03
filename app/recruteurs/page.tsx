import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'

export const metadata = { title: 'Espace Recruteur — SportKonnect' }

const HEALTH_LABELS: Record<string, string> = {
  FIT: 'Disponible', INJURED: 'Blessé', SUSPENDED: 'Suspendu', RECOVERING: 'Récupération',
}
const HEALTH_COLORS: Record<string, string> = {
  FIT: 'text-green-400', INJURED: 'text-red-400', SUSPENDED: 'text-yellow-400', RECOVERING: 'text-orange-400',
}

export default async function RecruteursPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN') redirect('/dashboard')

  let recruiter = await prisma.recruiter.findUnique({
    where: { userId: session.user.id },
    include: {
      favorites: {
        include: {
          player: {
            select: {
              id: true, firstName: true, lastName: true, photoUrl: true,
              positionMain: true, city: true, nationality: true, aiScore: true, healthStatus: true,
              stats: { orderBy: { season: 'desc' }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  // Crée le profil recruteur automatiquement s'il n'existe pas
  if (!recruiter) {
    recruiter = await prisma.recruiter.create({
      data: { userId: session.user.id, organization: 'À renseigner' },
      include: { favorites: { include: { player: { select: {
        id: true, firstName: true, lastName: true, photoUrl: true,
        positionMain: true, city: true, nationality: true, aiScore: true, healthStatus: true,
        stats: { orderBy: { season: 'desc' }, take: 1 },
      } } } } },
    }) as typeof recruiter
  }

  const favorites = recruiter?.favorites ?? []
  const avgScore = favorites.length > 0
    ? Math.round(favorites.reduce((s, f) => s + (f.player.aiScore ?? 0), 0) / favorites.length)
    : 0

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-white">Espace Recruteur</h1>
            <p className="font-inter text-[#9CA3AF] text-sm mt-1">
              {recruiter?.organization ?? 'Votre organisation'}
            </p>
          </div>
          <Link href="/recherche"
            className="bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-5 py-2.5 font-inter text-sm font-semibold transition-colors">
            🔍 Chercher des talents
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: favorites.length, label: 'Talents suivis' },
            { value: avgScore || '—', label: 'Score moyen' },
            { value: favorites.filter(f => f.player.healthStatus === 'FIT').length, label: 'Disponibles' },
          ].map((s) => (
            <div key={s.label} className="bg-[#111827] rounded-xl p-4 text-center shadow-lg shadow-black/20">
              <div className="font-poppins text-3xl font-bold text-[#22C55E]">{s.value}</div>
              <div className="font-inter text-xs text-[#9CA3AF] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pipeline favoris */}
        <div>
          <h2 className="font-poppins font-semibold text-white mb-4">
            Mon pipeline de talents ({favorites.length})
          </h2>

          {favorites.length === 0 ? (
            <div className="bg-[#111827] rounded-xl p-10 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <p className="font-poppins font-semibold text-white mb-2">Pipeline vide</p>
              <p className="font-inter text-sm text-[#9CA3AF] mb-5">
                Commence par chercher des joueurs et ajoute-les à ton pipeline.
              </p>
              <Link href="/recherche"
                className="inline-flex items-center bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-6 py-2.5 font-inter text-sm font-semibold transition-colors">
                Rechercher des talents →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map(({ player, notes, createdAt }) => {
                const stat = player.stats[0]
                return (
                  <div key={player.id} className="bg-[#111827] border border-white/5 rounded-xl p-4 shadow-lg shadow-black/20">
                    <div className="flex items-center gap-4">
                      {player.photoUrl ? (
                        <Image src={player.photoUrl} alt={player.firstName} width={52} height={52}
                          className="w-13 h-13 rounded-full object-cover border border-[#0B8F3C]/30 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#0B8F3C] flex items-center justify-center font-poppins font-bold text-white shrink-0">
                          {player.firstName[0]}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/profil/${player.id}`}
                            className="font-poppins font-bold text-white hover:text-[#22C55E] transition-colors">
                            {player.firstName} {player.lastName}
                          </Link>
                          <span className={`font-inter text-xs ${HEALTH_COLORS[player.healthStatus] ?? 'text-[#9CA3AF]'}`}>
                            ● {HEALTH_LABELS[player.healthStatus] ?? player.healthStatus}
                          </span>
                        </div>
                        <div className="font-inter text-sm text-[#9CA3AF] capitalize">
                          {player.positionMain}{player.city ? ` · ${player.city}` : ''}{player.nationality ? ` · ${player.nationality}` : ''}
                        </div>
                        {stat && (
                          <div className="flex gap-4 mt-1">
                            <span className="font-inter text-xs text-[#9CA3AF]">⚽ {stat.goals} buts</span>
                            <span className="font-inter text-xs text-[#9CA3AF]">🎯 {stat.assists} assists</span>
                            <span className="font-inter text-xs text-[#9CA3AF]">📅 {stat.matchesPlayed} matchs</span>
                          </div>
                        )}
                        {notes && (
                          <p className="font-inter text-xs text-[#9CA3AF] italic mt-1 truncate">📝 {notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {player.aiScore !== null && (
                          <div className="text-center">
                            <div className="font-poppins text-2xl font-bold text-[#22C55E]">{player.aiScore}</div>
                            <div className="font-inter text-[10px] text-[#9CA3AF]">SPG</div>
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <Link href={`/profil/${player.id}`}
                            className="font-inter text-xs text-[#9CA3AF] hover:text-white border border-white/10 hover:border-white/30 rounded-full px-3 py-1 transition-colors">
                            Voir profil
                          </Link>
                          <Link href={`/profil/${player.id}/print`} target="_blank"
                            className="font-inter text-xs text-[#9CA3AF] hover:text-[#22C55E] border border-white/10 hover:border-[#0B8F3C]/40 rounded-full px-3 py-1 transition-colors">
                            Export PDF
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
