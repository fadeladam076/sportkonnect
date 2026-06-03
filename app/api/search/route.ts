import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q        = searchParams.get('q')        ?? ''
  const position = searchParams.get('position') ?? ''
  const city     = searchParams.get('city')     ?? ''
  const minScore = parseInt(searchParams.get('minScore') ?? '0')

  const players = await prisma.player.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { firstName:    { contains: q, mode: 'insensitive' } },
            { lastName:     { contains: q, mode: 'insensitive' } },
            { nationality:  { contains: q, mode: 'insensitive' } },
          ],
        } : {},
        position ? { positionMain: { contains: position, mode: 'insensitive' } } : {},
        city     ? { city:         { contains: city,     mode: 'insensitive' } } : {},
        minScore ? { aiScore:      { gte: minScore } }                            : {},
      ],
    },
    select: {
      id: true, firstName: true, lastName: true,
      positionMain: true, city: true, nationality: true,
      photoUrl: true, aiScore: true, healthStatus: true,
    },
    orderBy: { aiScore: 'desc' },
    take: 30,
  })

  return NextResponse.json(players)
}
