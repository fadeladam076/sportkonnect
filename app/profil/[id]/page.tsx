import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlayerCard } from '@/components/profil/PlayerCard'
import { StatsGrid } from '@/components/profil/StatsGrid'
import { PlayerRadarChart } from '@/components/profil/RadarChart'
import Image from 'next/image'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const player = await prisma.player.findUnique({ where: { id }, select: { firstName: true, lastName: true } })
  if (!player) return {}
  return { title: `${player.firstName} ${player.lastName} — SportKonnect` }
}

export default async function ProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      user: { select: { id: true } },
      stats: { orderBy: { season: 'desc' }, take: 1 },
      media: { where: { category: 'HIGHLIGHT' }, take: 6, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!player) notFound()

  const latestStats = player.stats[0] ?? null
  const isOwner = session?.user?.id === player.user.id

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0F172A]/80 backdrop-blur">
        <Link href="/dashboard">
          <Image src="/logo-white.png" alt="SportKonnect" width={130} height={32} className="h-7 w-auto" />
        </Link>
        {session && (
          <Link
            href="/dashboard"
            className="font-inter text-sm text-[#9CA3AF] hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Carte principale */}
        <PlayerCard
          player={{ ...player, stats: player.stats }}
          isOwner={isOwner}
          editHref="/profil/completer"
        />

        {/* Stats + Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="bg-[#111827] rounded-xl p-5 shadow-lg shadow-black/20">
            <h3 className="font-poppins font-semibold text-white mb-4">Profil physique</h3>
            <PlayerRadarChart stats={latestStats} />
          </div>

          {/* Stats grid */}
          <div className="bg-[#111827] rounded-xl p-5 shadow-lg shadow-black/20">
            <StatsGrid stats={latestStats} />
          </div>
        </div>

        {/* Highlights */}
        {player.media.length > 0 && (
          <div className="bg-[#111827] rounded-xl p-5 shadow-lg shadow-black/20">
            <h3 className="font-poppins font-semibold text-white mb-4">Highlights</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {player.media.map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-video bg-[#0F172A] rounded-lg overflow-hidden group"
                >
                  {m.thumbnail ? (
                    <Image src={m.thumbnail} alt={m.title ?? 'Highlight'} fill className="object-cover group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl">▶</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CTA compléter profil si owner et profil incomplet */}
        {isOwner && (!player.city || !player.nationality || !player.positionMain) && (
          <div className="bg-[#111827] border border-[#0B8F3C]/30 rounded-xl p-6 text-center">
            <p className="font-poppins font-semibold text-white mb-2">
              Complète ton passeport
            </p>
            <p className="font-inter text-sm text-[#9CA3AF] mb-4">
              Ajoute tes informations pour être visible par les recruteurs.
            </p>
            <Link
              href="/profil/completer"
              className="inline-flex items-center bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-6 py-2.5 font-inter font-semibold text-sm transition-colors"
            >
              Compléter mon profil →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
