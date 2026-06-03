import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const recruiter = await prisma.recruiter.findUnique({ where: { userId: session.user.id } })
  if (!recruiter) return NextResponse.json({ error: 'Profil recruteur requis.' }, { status: 403 })

  const favorites = await prisma.recruiterFavorite.findMany({
    where:   { recruiterId: recruiter.id },
    include: {
      player: {
        select: {
          id: true, firstName: true, lastName: true, photoUrl: true,
          positionMain: true, city: true, nationality: true, aiScore: true, healthStatus: true,
          stats: { orderBy: { season: 'desc' }, take: 1,
            select: { goals: true, assists: true, matchesPlayed: true, season: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(favorites)
}
