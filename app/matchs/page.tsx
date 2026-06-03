import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { MatchsContent } from '@/components/match/MatchsContent'

export const metadata = { title: 'Matchs — SportKonnect' }

export default async function MatchsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; level?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { city = '', level = '' } = await searchParams

  const matches = await prisma.match.findMany({
    where: {
      status: { in: ['OPEN', 'FULL'] },
      date: { gte: new Date() },
      ...(city  ? { city:  { contains: city,  mode: 'insensitive' } } : {}),
      ...(level ? { level: { equals: level } }                        : {}),
    },
    include: {
      _count: { select: { participants: true } },
      club:   { select: { name: true, logoUrl: true } },
    },
    orderBy: { date: 'asc' },
    take: 50,
  })

  const serialized = matches.map((m) => ({
    ...m,
    date: m.date.toISOString(),
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0">
      <Navbar />
      <MatchsContent matches={serialized} city={city} level={level} />
      <MobileNav />
    </div>
  )
}
