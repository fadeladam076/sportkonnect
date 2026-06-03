import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'

export const metadata = { title: 'Dashboard — SportKonnect' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  let player = null
  if (session.user.role === 'PLAYER') {
    player = await prisma.player.findFirst({
      where: { userId: session.user.id },
      select: { id: true, firstName: true, lastName: true, positionMain: true, city: true, nationality: true, aiScore: true },
    })
  }

  const isProfileComplete =
    player && player.positionMain && player.city && player.nationality

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Bienvenue */}
        <div>
          <h1 className="font-poppins text-2xl font-bold text-white mb-1">
            Bonjour{player ? `, ${player.firstName}` : ''} 👋
          </h1>
          <p className="font-inter text-[#9CA3AF] text-sm">
            Bienvenue sur SportKonnect.
          </p>
        </div>

        {/* CTA profil incomplet */}
        {player && !isProfileComplete && (
          <div className="bg-[#111827] border border-[#0B8F3C]/40 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">📋</span>
              <div className="flex-1">
                <h2 className="font-poppins font-semibold text-white mb-1">
                  Complète ton passeport
                </h2>
                <p className="font-inter text-sm text-[#9CA3AF] mb-4">
                  Ajoute ta nationalité, ta ville et ton poste pour apparaître dans les recherches recruteurs.
                </p>
                <Link
                  href="/profil/completer"
                  className="inline-flex items-center bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-5 py-2.5 font-inter text-sm font-semibold transition-colors"
                >
                  Compléter mon profil →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Carte joueur si profil complet */}
        {player && isProfileComplete && (
          <div className="bg-[#111827] rounded-xl p-6 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-poppins text-xl font-bold text-white">
                  {player.firstName} {player.lastName?.toUpperCase()}
                </h2>
                <p className="font-inter text-sm text-[#9CA3AF] mt-1">
                  {player.positionMain} · {player.city}
                </p>
              </div>
              {player.aiScore !== null && (
                <div className="text-center">
                  <div className="font-poppins text-4xl font-bold text-[#22C55E]">{player.aiScore}</div>
                  <div className="font-inter text-xs text-[#9CA3AF]">SPG / 100</div>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-3 flex-wrap">
              <Link
                href={`/profil/${player.id}`}
                className="inline-flex items-center bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-5 py-2 font-inter text-sm font-semibold transition-colors"
              >
                Voir mon profil
              </Link>
              <Link
                href="/profil/completer"
                className="inline-flex items-center border border-white/20 hover:border-white/50 text-white rounded-full px-5 py-2 font-inter text-sm font-medium transition-colors"
              >
                Modifier
              </Link>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '📰 Feed',       href: '/feed',      desc: "Fil d'actualité" },
            { label: '⚽ Matchs',     href: '/matchs',    desc: 'Rejoindre un match' },
            { label: '🔍 Recherche',  href: '/recherche', desc: 'Trouver des joueurs' },
            { label: '💬 Messages',   href: '/messages',  desc: 'Messagerie' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-[#111827] hover:bg-[#1a2332] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all"
            >
              <div className="font-poppins font-semibold text-white text-sm">{item.label}</div>
              <div className="font-inter text-xs text-[#9CA3AF] mt-1">{item.desc}</div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <span className="inline-flex items-center gap-2 bg-[#111827] border border-[#0B8F3C]/20 rounded-full px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="font-inter text-xs text-[#9CA3AF]">Phase 2 en cours — Feed & Matchs disponibles</span>
          </span>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
