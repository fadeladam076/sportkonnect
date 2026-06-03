import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { JoinButton } from './JoinButton'

const LEVEL_LABELS: Record<string, string> = {
  debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé', pro: 'Pro',
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      club: { select: { name: true, logoUrl: true } },
      participants: {
        include: {
          player: { select: { id: true, firstName: true, lastName: true, photoUrl: true, positionMain: true } },
        },
      },
      _count: { select: { participants: true } },
    },
  })

  if (!match) notFound()

  let currentPlayerId: string | null = null
  if (session?.user) {
    const p = await prisma.player.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    currentPlayerId = p?.id ?? null
  }

  const isJoined = currentPlayerId
    ? match.participants.some((p) => p.playerId === currentPlayerId)
    : false
  const isFull   = match._count.participants >= match.maxPlayers
  const canJoin  = !!session && !!currentPlayerId && match.status === 'OPEN' && !isFull

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(match.date)

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Link href="/matchs" className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white font-inter text-sm transition-colors">
          ← Tous les matchs
        </Link>

        {/* Carte match */}
        <div className="bg-[#111827] rounded-xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="font-poppins text-2xl font-bold text-white">{match.title}</h1>
            <span className="shrink-0 bg-[#0B8F3C]/10 text-[#22C55E] border border-[#0B8F3C]/30 rounded-full px-3 py-1 font-inter text-xs font-medium">
              {LEVEL_LABELS[match.level] ?? match.level}
            </span>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 font-inter text-sm text-[#9CA3AF]">
              <span className="text-lg">📅</span>
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 font-inter text-sm text-[#9CA3AF]">
              <span className="text-lg">📍</span>
              <span>{match.city} — {match.address}</span>
            </div>
            {match.club && (
              <div className="flex items-center gap-3 font-inter text-sm text-[#9CA3AF]">
                <span className="text-lg">🏟️</span>
                <span>{match.club.name}</span>
              </div>
            )}
            {(match.ageMin || match.ageMax) && (
              <div className="flex items-center gap-3 font-inter text-sm text-[#9CA3AF]">
                <span className="text-lg">👤</span>
                <span>
                  {match.ageMin && match.ageMax ? `${match.ageMin}–${match.ageMax} ans`
                    : match.ageMin ? `${match.ageMin}+ ans` : `–${match.ageMax} ans`}
                </span>
              </div>
            )}
          </div>

          {/* Jauge */}
          <div className="mb-5">
            <div className="flex justify-between font-inter text-xs text-[#9CA3AF] mb-2">
              <span>{match._count.participants} joueurs inscrits</span>
              <span>{match.maxPlayers} max</span>
            </div>
            <div className="w-full bg-[#0F172A] rounded-full h-2">
              <div
                className="bg-[#0B8F3C] h-2 rounded-full transition-all"
                style={{ width: `${Math.min((match._count.participants / match.maxPlayers) * 100, 100)}%` }}
              />
            </div>
          </div>

          <JoinButton
            matchId={match.id}
            isJoined={isJoined}
            canJoin={canJoin}
            isFull={isFull}
            status={match.status}
            isLoggedIn={!!session}
          />
        </div>

        {/* Liste des participants */}
        <div className="bg-[#111827] rounded-xl p-5 shadow-lg shadow-black/20">
          <h2 className="font-poppins font-semibold text-white mb-4">
            Joueurs inscrits ({match._count.participants})
          </h2>
          {match.participants.length === 0 ? (
            <p className="font-inter text-sm text-[#9CA3AF]">Aucun joueur inscrit pour l&apos;instant.</p>
          ) : (
            <div className="space-y-3">
              {match.participants.map(({ player }) => (
                <Link key={player.id} href={`/profil/${player.id}`} className="flex items-center gap-3 group">
                  {player.photoUrl ? (
                    <Image src={player.photoUrl} alt={`${player.firstName}`} width={36} height={36} className="w-9 h-9 rounded-full object-cover border border-[#0B8F3C]/30" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0B8F3C] flex items-center justify-center font-poppins text-sm font-bold text-white">
                      {player.firstName[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-inter text-sm text-white group-hover:text-[#22C55E] transition-colors">
                      {player.firstName} {player.lastName}
                    </div>
                    {player.positionMain && (
                      <div className="font-inter text-xs text-[#9CA3AF] capitalize">{player.positionMain}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
